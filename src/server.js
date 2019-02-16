const argv = require('yargs').argv;
const cron = require('node-cron');
const upcomings = require('./server');

let router = require('./server/router');
if (argv.dev) {
    router.listen('8888');
}
else {
    router.listen('3000');
}
 
cron.schedule('0 4 * * *', () => {
  console.log('running refreshUpcomings at 4am every day');
  upcomings();
});