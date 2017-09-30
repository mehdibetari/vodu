let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let async   = require('async');
let colors = require('colors');
var uploadcare = require('uploadcare')('677798e572bfce424b48', '159a48768c425d3918b5');

const imdbBaseUrl = 'http://www.imdb.com';
const imdbSearchStartUrl = '/find?ref_=nv_sr_fn&q=';
const imdbSearchEndUrl = '&s=all';
function getMediaListUrl (name, year) {
    return imdbBaseUrl + 
        imdbSearchStartUrl + 
        encodeURIComponent(name + '+' +year) + 
        imdbSearchEndUrl;
}
function listScrapping (mediasFounded, titleToFound, name, year, $, lock, callback) {
    console.log('  STEP # MATCHING LIST TITLES ');
    async.eachSeries(mediasFounded, function(media, done){
        console.log('      Matching test : ',$(media).text().toLowerCase().replace(/\s/g,'') ,' => ', titleToFound.toLowerCase().replace(/\s/g,''));
        // console.log($(media).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) );
        let textExactlyMatch = $(media).text().toLowerCase().replace(/\s/g,'') === titleToFound.toLowerCase().replace(/\s/g,'');
        let textExactlyStart = $(media).text().toLowerCase().replace(/\s/g,'').indexOf(titleToFound.toLowerCase().replace(/\s/g,'')) === 0;
        if (!lock && textExactlyMatch || textExactlyStart) {
            lock = true;
            let mediaLink = $(media).find('a').attr('href');
            console.log('        Media link '+ colors.green('FOUNDED') + ' : ',name, ' => ',mediaLink);
            console.log('  STEP # SCRAPE MEDIA: ',name);
            request(imdbBaseUrl + mediaLink, function(mediaError, mediaResponse, mediaHtml){
                if(!mediaError) {
                    console.log('    Media scrappin '+ colors.green('SUCCESS') + ' at ',mediaLink);
                    let $ = cheerio.load(mediaHtml);
                    let posterUrl = $('.poster img').attr('src');
                    let actors = '';
                    $('.credit_summary_item span[itemprop*="actors"] a span').each(function(i){
                        actors += $(this).text();
                        actors += (i < $('.credit_summary_item span[itemprop*="actors"] a span').length - 1) ? ', ' : '...';
                    });
                    let directors = '';
                    $('.credit_summary_item span[itemprop*="director"] a span').each(function(i){
                        directors += $(this).text();
                        directors += (i < $('.credit_summary_item span[itemprop*="director"] a span').length - 1) ? ', ' : '...';
                    });
                    let creators = '';
                    $('.credit_summary_item span[itemprop*="creator"] a span').each(function(i){
                        creators += $(this).text();
                        creators += (i < $('.credit_summary_item span[itemprop*="creator"] a span').length - 1) ? ', ' : '...';
                    });
                    let summary = '';
                    summary += $('.summary_text[itemprop*="description"]').text();
                    console.log('  STEP # DOWNLOAD : ', name, ' ', year);
                    download(posterUrl,'./posters/' + name + '+' +year + '.jpg', function (path) {
                        const addedMessage = '    ✓ Poster '+ colors.green('ADDED') + ' at ' + path;
                        const failedMessage = colors.bgYellow.white('MEDIA POSTER ABORDED') + ' => ' + name + year + colors.magenta(' ✘ Poster DOES NOT downloaded') + colors.green(' ✓ but meta data does');
                        console.log( (path) ? addedMessage : failedMessage);
                        callback({'actors': actors, 'localPath': path, 'posterUrl': posterUrl, 'mediaLink': mediaLink, 'directors': directors, 'creators': creators, 'summary' : summary});
                    });
                }
                else {
                    console.log('    Media scrappin '+ colors.red('FAILED'));
                    // console.log(mediaError);
                    callback({});
                }
            });
            return false;
        }
        else {
            console.log('        Media title '+ colors.red('DONT MATCH'));
            done();
        }
    }, function(e) {
        console.log(colors.bgRed.white('MEDIA SEARCH ABORDED'),' => ',name,year,colors.magenta(' ✘ MEDIA NOT FOUND IN LIST'));
        callback({});
    });
}
function getMedia(name, year, callback) {
    console.log(colors.inverse('IMDB media to found'),colors.bgGreen.white(name,year));

    let url = getMediaListUrl(name, year);
    let lock = false;
    console.log('  STEP # SCRAPE LIST: ',name, ' ',year);
    request(url, function(mediasError, mediasResponse, mediasHtml){
        if(!mediasError) {
            console.log('    1st List scrappin with exact year '+ colors.green('SUCCESS'));
            let titleToFound = name + ' (' + year + ')';
            let $ = cheerio.load(mediasHtml);
            let mediasFounded = $('.findList tbody tr.findResult td.result_text');
            if (!mediasFounded || mediasFounded.length < 1) {
                console.log('      List scrappin '+ colors.red('WITHOUT MEDIA'));
                url = getMediaListUrl(name, --year);
                request(url, function(mediasError, mediasResponse, mediasHtml){
                    console.log('    2nd List scrappin with decreased year '+ colors.green('SUCCESS'));
                    titleToFound = name + ' (' + year + ')';
                    $ = cheerio.load(mediasHtml);
                    mediasFounded = $('.findList tbody tr.findResult td.result_text');
                    if (!mediasFounded || mediasFounded.length < 1) {
                        console.log('      List scrappin '+ colors.red('WITHOUT MEDIA'));
                        console.log(colors.bgRed.white('MEDIA SEARCH ABORDED'),' => ',name,year,colors.magenta(' ✘ NO LIST FOUNDED'));
                        callback({});
                    }
                    else {
                        listScrapping(mediasFounded, titleToFound, name, year, $, lock, callback);
                    }
                });
            }
            else {
                listScrapping(mediasFounded, titleToFound, name, year, $, lock, callback);
            }
        }
        else {
            console.log('    List scrappin '+ colors.red('FAILED '));
            // console.log(mediasError);
            callback({});
        }
    });

}

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

exports.getMedia = getMedia;