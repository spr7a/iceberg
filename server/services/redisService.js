const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_USERNAME = process.env.REDIS_USERNAME || '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

const REDIS_URL =
  process.env.REDIS_URL ||
  (REDIS_USERNAME && REDIS_PASSWORD
    ? `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
    : `redis://${REDIS_HOST}:${REDIS_PORT}`);

console.log('[Redis] Connecting to:', REDIS_HOST + ':' + REDIS_PORT);

let client = null;

const getClient = async () => {
  if (client && client.isOpen) {
    console.log('[Redis] Reusing existing connection');
    return client;
  }

  console.log('[Redis] Creating new connection...');
  client = redis.createClient({ url: REDIS_URL });

  client.on('error', (err) => console.error('[Redis] Error:', err.message));
  client.on('connect', () => console.log('[Redis] Client connected'));
  client.on('ready', () => console.log('[Redis] Client ready'));
  client.on('end', () => console.log('[Redis] Connection ended'));

  await client.connect();
  console.log('[Redis] Connection established');
  return client;
};

const trackQuery = async (queryTopic, summaryJson) => {
  const topicKey = queryTopic.toLowerCase().trim();
  console.log('[Redis] trackQuery: tracking "' + topicKey + '"');

  try {
    const redisClient = await getClient();

    await redisClient.zIncrBy('trending_queries', 1, topicKey);
    console.log('[Redis] trackQuery: ZINCRBY +1 for "' + topicKey + '"');

    await redisClient.setEx(
      `brief:${topicKey}`,
      604800,
      JSON.stringify(summaryJson)
    );
    console.log('[Redis] trackQuery: SETEX brief:' + topicKey + ' (7d TTL)');
  } catch (err) {
    console.error('[Redis] trackQuery error:', err.message);
  }
};

const getTrending = async (count = 10) => {
  console.log('[Redis] getTrending: fetching top ' + count + ' items');

  try {
    const redisClient = await getClient();

    const results = await redisClient.zRange('trending_queries', 0, count - 1, {
      REV: true,
      WITHSCORES: true,
    });

    console.log('[Redis] getTrending: got ' + (results ? results.length : 0) + ' items');

    if (!results || results.length === 0) return [];

    const itemCount = results.length / 2;
    const trending = await Promise.all(
      Array.from({ length: itemCount }, async (_, index) => {
        const topic = results[index * 2];
        const score = Number(results[index * 2 + 1]);

        let summary = null;
        try {
          const raw = await redisClient.get(`brief:${topic}`);
          if (raw) summary = JSON.parse(raw);
        } catch (err) {
          console.log('[Redis] getTrending: GET brief:' + topic + ' error:', err.message);
        }

        return { topic, score, summary };
      })
    );

    return trending;
  } catch (err) {
    console.error('[Redis] getTrending error:', err.message);
    return [];
  }
};

const resetMonthlyTrending = async () => {
  console.log('[Redis] resetMonthlyTrending: starting cleanup');

  try {
    const redisClient = await getClient();

    const all = await redisClient.zRange('trending_queries', 0, -1, {
      WITHSCORES: true,
    });

    if (!all || all.length === 0) {
      console.log('[Redis] resetMonthlyTrending: no data');
      return;
    }

    const pipeline = redisClient.multi();
    pipeline.del('trending_queries');
    for (let i = 0; i < all.length; i += 2) {
      const topic = all[i];
      pipeline.del(`brief:${topic}`);
    }
    await pipeline.exec();

    console.log('[Redis] resetMonthlyTrending: cleared ' + all.length + ' items');
  } catch (err) {
    console.error('[Redis] resetMonthlyTrending error:', err.message);
  }
};

const close = async () => {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
    console.log('[Redis] Connection closed');
  }
};

module.exports = {
  getClient,
  trackQuery,
  getTrending,
  resetMonthlyTrending,
  close,
};