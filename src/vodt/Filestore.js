const request = require('request');
const AWS = require('aws-sdk');

const Store = async (props) => {
    if (!props.sourceUrl) return false;
    const awsS3Connect = new AWS.S3({
        accessKeyId: props.options.AWS_ACCESS_KEY,
        secretAccessKey: props.options.AWS_SECRET_ACCESS_KEY
      });
    return await _uploadOnDistant(props, awsS3Connect);
};

const _uploadOnDistant = async (props, awsS3Connect) => {
    return new Promise((resolve, reject) => {
        const s3ObjectParams = {
            Bucket: props.options.AWS_BUCKET_NAME,
            MaxKeys: 20,
            Delimiter: '/',
            Prefix: props.destinationPath
        };
        awsS3Connect.listObjectsV2 (s3ObjectParams, (err, data) => {
            if (err) reject(err)
            if (data && data.Contents.length > 0) {
                console.log(`File already exist at https://${props.options.AWS_CF_BASE_URL}/${data.Contents[0].Key}`);
                resolve(`https://${props.options.AWS_CF_BASE_URL}/${data.Contents[0].Key}`);
            }
            else {
                return resolve(_uploadOnS3FromUrl(props, awsS3Connect));
            }
        });
    });
};

const _uploadOnS3FromUrl = ({sourceUrl, destinationPath, destinationFileName, options}, awsS3Connect) => {
    return new Promise((resolve, reject) => {
        var params = {
            uri: sourceUrl,
            encoding: null
        };
        request(params, function(error, response, body) {
            if (error || response.statusCode !== 200) { 
                console.log("failed to get image");
                reject(error || response);
            } else {
                const params = {
                    Bucket: options.AWS_BUCKET_NAME,
                    Key: `${destinationPath}${destinationFileName}`,
                    Body: body
                };
                awsS3Connect.upload(params, function(s3Err, data) {
                    if (s3Err) reject(s3Err);
                    console.log(`File uploaded successfully at ${data.Location}`);
                    resolve(`https://${options.AWS_CF_BASE_URL}/${destinationPath}${destinationFileName}`);
                });
            }
        });
    });
}

module.exports =  Store;
