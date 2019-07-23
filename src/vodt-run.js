const { run } = require('v0dt');
const { S3 } = require('./config-keys');
const configServer = require('./server/config-server').configServer;
const path = {
    netflix: configServer.ALLOSERIE_NETFLIX_TOPS_STORE_LANG,
    amazon: configServer.ALLOSERIE_AMAZON_TOPS_STORE_LANG
}

const refreshNetflixTops = (provider = 'netflix') => {
    run({
        destinationPath: path[provider],
        awskeys: { S3 },
        provider
    });
};

module.exports = refreshNetflixTops;
