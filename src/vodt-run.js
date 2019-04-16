const { run } = require('./vodt/index');
const { S3 } = require('./config-keys');
const configServer = require('./server/config-server').configServer;

const refreshNetflixTops = () => {
    run({
        destinationPath: configServer.ALLOSERIE_NETFLIX_TOPS_STORE_LANG,
        awskeys: { S3 }
    });
};

module.exports = refreshNetflixTops;
