const cron = require('node-cron');
const { updateTrendingSkills } = require('./controllers/postController');

const startScheduler = () => {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log(`[${new Date().toISOString()}] Running scheduled trending skills update`);
    updateTrendingSkills();
  });
};

module.exports = { startScheduler };