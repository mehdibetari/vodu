let request       = require('request');
let cheerio       = require('cheerio');
let colors        = require('colors');
const Filestorage = require('../media-storage/Filestorage');

const NETFLIX_BASE_URL = 'https://media.netflix.com';

function getPoster (uri, name, year, uploadcare, callback) {
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
                let posterStore = new Filestorage();
                posterStore.download(posterUri,'./public/posters/' + name.replace('/','') + '+' + year + '.jpg', uploadcare, function (path) {
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