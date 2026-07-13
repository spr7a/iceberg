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

  console.log('[Cron] Monthly trending reset job scheduled (1st of every month at midnight)');
};

module.exports = { startMonthlyResetJob };