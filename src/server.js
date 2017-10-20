const argv = require('yargs').argv;

let router = require('./server/router');
if (argv.dev) {
    router.listen('8888');
}
else {
    router.listen('80');
}