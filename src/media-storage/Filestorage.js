const STORE_UPLOADCARE_BASE_URL = 'https://ucarecdn.com/';

class Filestorage {

    constructor() {

    }

    download (uri, filename, callback, local, distant) {
        if (!uri) return callback(false);
        if (local) {
            downloadLocaly(uri, filename, function (state) {
                callback(state);
            });
        }
        if (distant) {
            uploadOnDistant(uri, function () {
                callback(distantUrl);
            });
        }
    }

    downloadLocaly (uri, filename, callback) {
        request.head(uri, function(err, res, body){
            // console.log('content-type:', res.headers['content-type']);
            // console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
                callback(true);
            });
        });
    }

    uploadOnDistant (url, callback) {
        //Upload from URL
        uploadcare.file.fromUrl(url, callback, function(err,res){
            //Res should contain returned file ID
            let uplc_filepath = STORE_UPLOADCARE_BASE_URL + res.file_id + '/' + res.filename;
            callback(uplc_filepath);
        });
    }
}
module.exports =  Filestorage;