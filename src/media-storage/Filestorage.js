const configKeys   = require('../config-keys');
const fs           = require('fs');
const request      = require('request');
const uploadcare   = require('uploadcare')(configKeys.uploadcare.public_key, configKeys.uploadcare.private_key);
const AWS          = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: configKeys.S3.AWS_ACCESS_KEY,
  secretAccessKey: configKeys.S3.AWS_SECRET_ACCESS_KEY
});
const BUCKET_NAME = 'cf-simple-s3-origin-cloudfrontfors3-642578718534';

const STORE_UPLOADCARE_BASE_URL = 'https://ucarecdn.com/';

class Filestorage {

    constructor() {

    }

    download (uri, filePath, fileName, logger, callback) {
        if (!uri) return callback(false);
        this.uploadOnDistant(uri, filePath, fileName, logger, callback);
    }

    downloadLocaly (uri, filename, callback) {
        request.head(uri, function(){
            // console.log('content-type:', res.headers['content-type']);
            // console.log('content-length:', res.headers['content-length']);
            if (!fs.existsSync('./public/posters/')){
                fs.mkdirSync('./public/posters/');
            }
            request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
                callback('/posters/' + filename);
            });
        });
    }

    uploadOnDistantWithUploadcare (url, callback) {
        //Upload from URL
        uploadcare.file.fromUrl(url, function(err,res){
            //Res should contain returned file ID
            let uplc_filepath = STORE_UPLOADCARE_BASE_URL + res.file_id + '/' + res.filename;
            callback(uplc_filepath);
        });
    }

    uploadOnDistant (sourceUrl, filepath, filename, logger, callback) {
        const s3params = {
            Bucket: BUCKET_NAME,
            MaxKeys: 20,
            Delimiter: '/',
            Prefix: filepath
        };
        s3.listObjectsV2 (s3params, (err, data) => {
            if (err) {
                console.log(err);
            }
            // console.log('data =>', data);
            if (data && data.Contents.length > 0) {
                callback(`https://${BUCKET_NAME}/${data.Contents[0].Key}`);
            }
            else {
                this.uploadOnS3FromUrl(sourceUrl, filepath, filename, logger, callback);
            }
        });
    }

    uploadOnS3FromUrl (sourceUrl, filepath, filename, logger, callback) {
        var options = {
            uri: sourceUrl,
            encoding: null
        };
        request(options, function(error, response, body) {
            if (error || response.statusCode !== 200) { 
                console.log("failed to get image");
                console.log(error);
            } else {
                const params = {
                    Bucket: BUCKET_NAME,
                    Key: `${filepath}${filename}`,
                    Body: body
                };
                s3.upload(params, function(s3Err, data) {
                    if (s3Err) throw s3Err
                    console.log(`File uploaded successfully at ${data.Location}`);
                    logger(`File uploaded successfully at ${data.Location}`);
                    callback(`https://${BUCKET_NAME}/${filepath}${filename}`);
                });
            }
        });
    }
}
module.exports =  Filestorage;