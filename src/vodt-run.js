const { run } = require('./vodt/index');
const { S3 } = require('./config-keys');
run({
    destinationPath: './store/netflix-best',
    awskeys: { S3 }
});
