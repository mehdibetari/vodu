const { run } = require('./vodt/index');
const { S3 } = require('./config-keys');

const refreshNetflixTops = () => {
    run({
        destinationPath: '/store/netflix-best',
        awskeys: { S3 }
    });
};

module.exports = refreshNetflixTops;
