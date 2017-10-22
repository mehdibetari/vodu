const configKeys = require('../config-keys');
let fs           = require('fs');
let request      = require('request');
let uploadcare   = require('uploadcare')(configKeys.uploadcare.public_key, configKeys.uploadcare.private_key);

const STORE_UPLOADCARE_BASE_URL = 'https://ucarecdn.com/';

class Filestorage {

    constructor() {

    }

    download (uri, filename, uploadcare, callback) {
        if (!uri) return callback(false);
        if (uploadcare) {
            this.uploadOnDistant(uri, function (distantUrl) {
                callback(distantUrl);
            });
        }
        else {
            this.downloadLocaly(uri, filename, function (state) {
                callback(state);
            });
        }
    }

    downloadLocaly (uri, filename, callback) {
        request.head(uri, function(err, res, body){
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

    uploadOnDistant (url, callback) {
        //Upload from URL
        uploadcare.file.fromUrl(url, function(err,res){
            //Res should contain returned file ID
            let uplc_filepath = STORE_UPLOADCARE_BASE_URL + res.file_id + '/' + res.filename;
            callback(uplc_filepath);
        });
    }
}
module.exports =  Filestorage;