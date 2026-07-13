const cron = require('node-cron');
const { resetMonthlyTrending } = require('../services/redisService');

const startMonthlyResetJob = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('[Cron] Running monthly trending reset');
    try {
      await resetMonthlyTrending();
    } catch (err) {
      console.error('[Cron] resetMonthlyTrending error:', err.message);
    }
  });
};

module.exports = { startMonthlyResetJob };