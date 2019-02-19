const request      = require('request');
const cheerio      = require('cheerio');
const colors       = require('colors');
const h2p          = require('html2plaintext');
const Slug         = require('slugify');
const Filestorage  = require('../media-storage/Filestorage');

const NETFLIX_BASE_URL = 'https://media.netflix.com';

function getPoster (uri, name, year, id, logger, callback) {
    console.log(colors.inverse('NETFLIX poster to found'),colors.bgGreen.white(name,year));
    request(NETFLIX_BASE_URL+uri, function(error, response, html){
        if(!error){
            console.log('  STEP # SCRAPE NETFLIX POSTER');
            const $ = cheerio.load(html);
            let posterUri = $('img','.nfo-poster-img-container').filter(function(){
                return ($(this).attr('src') === '/dist/img/no-key-art.jpg') ? false : $(this).attr('src');
            });
            const description = $('p','.nfo-intro').filter(function() {
                return $(this).html() !== '';
            });

            if (description && posterUri && posterUri !== '' && posterUri.length > 0) {
                console.log('    NETFLIX POSTER description : '+ description);
                posterUri = $(posterUri).attr('src');
                console.log('    NETFLIX POSTER URL : '+ posterUri);
                let posterStore = new Filestorage();
                const fileName = `${Slug(name, { lower: true, remove: /[$*_+~.()'"!\-:@]/g })}-${year}.jpg`;
                const filePath = `posters/${year}${id}/`;
                posterStore.download(posterUri, filePath, fileName, logger, function (path) {
                    const addedMessage = '    ✓ Poster '+ colors.green('ADDED') + ' at ' + path;
                    const failedMessage = colors.bgRed.white('POSTER SEARCH ABORDED') + ' => ' + name + year + colors.magenta(' ✘ Poster DOES NOT downloaded');
                    console.log( (path) ? addedMessage : failedMessage);
                    callback({'posterUrl': path, 'sourceUrl': posterUri, description: h2p(description)});
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