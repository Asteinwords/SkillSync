const schedule = require('node-schedule');
const { autoMarkDone } = require('./controllers/sessionController');

// Run every minute to check for sessions past their endTime
const job = schedule.scheduleJob('* * * * *', async () => {
  console.log('Running autoMarkDone job at', new Date().toISOString());
  await autoMarkDone();
});

module.exports = job;