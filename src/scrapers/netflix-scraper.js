let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let colors = require('colors');
let uploadcare = require('uploadcare')('677798e572bfce424b48', '159a48768c425d3918b5');


const NETFLIX_BASE_URL = 'https://media.netflix.com';

function download (uri, filename, callback){
    if (!uri) return callback(false);
    request.head(uri, function(err, res, body){
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
            //Upload from URL
            uploadcare.file.fromUrl(uri, function(err,res){
                //Res should contain returned file ID
                let uplc_filepath = 'https://ucarecdn.com/' + res.file_id + '/' + res.filename;
                callback(uplc_filepath);
            });
        });
    });
}

function getPoster (uri, name, year, callback) {
    console.log(colors.inverse('NETFLIX poster to found'),colors.bgGreen.white(name,year));
    request(NETFLIX_BASE_URL+uri, function(error, response, html){
        if(!error){
            console.log('  STEP # SCRAPE NETFLIX POSTER');
            const $ = cheerio.load(html);
            let posterUri = $('img','.nfo-poster-img-container').filter(function(){
                return ($(this).attr('src') === '/dist/img/no-key-art.jpg') ? false : $(this).attr('src');
            });
            if (posterUri && posterUri !== '' && posterUri.length > 0) {
                posterUri = $(posterUri).attr('src');
                console.log('    NETFLIX POSTER URL : '+posterUri);
                download(posterUri,'./public/posters/' + name + '+' + year + '.jpg', function (path) {
                    const addedMessage = '    ✓ Poster '+ colors.green('ADDED') + ' at ' + path;
                    const failedMessage = colors.bgRed.white('POSTER SEARCH ABORDED') + ' => ' + name + year + colors.magenta(' ✘ Poster DOES NOT downloaded');
                    console.log( (path) ? addedMessage : failedMessage);
                    callback({'localPath': path, 'posterUrl': posterUri});
                });
            }
            else {                
                console.log('    NETFLIX POSTER '+ colors.red('NOT FOUND'));
                console.log(colors.bgRed.white('POSTER SEARCH ABORDED') + ' => ' + name + year + colors.magenta(' ✘ Poster DOES NOT founded'));
                callback({});
            }
        }
        else {
            console.log('    NETFLIX URI '+ colors.red('FAILED'));
            console.log(colors.bgRed.white('POSTER SEARCH ABORDED') + ' => ' + name + year + colors.magenta(' ✘ uri FAILED'));
            callback({});
        }
    });
}

exports.getPoster = getPoster;