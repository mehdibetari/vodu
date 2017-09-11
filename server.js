var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async   = require('async');

app.get('/scrape', function(req, res){
    baseUrl = 'https://media.netflix.com';
    url = 'https://media.netflix.com/gateway/v1/fr/titles/upcoming';

    request(url, function(mainError, mainResponse, mainHtml){
        var results = JSON.parse(mainResponse.body);
        var newItems = [];
        var cpt = 0;
        
        if(!mainError && results.items && results.meta.result.totalItems) {
            async.mapSeries(results.items, function(item, done){
                if (item.uri) {
                    cpt++;
                    request(baseUrl+item.uri, function(error, response, html){
                
                        if(!error){
                            var $ = cheerio.load(html);
                            
                            var imgSrc;
                            var json = { imgSrc : ""};
                            
                            $('img','.nfo-poster-img-container').filter(function(){
                                var imgTemp = ($(this).attr('src') === '/dist/img/no-key-art.jpg') ? false : $(this).attr('src');
                                item.imgUrl = imgTemp;
                                
                                console.log(cpt, '/', results.items.length,' ############ :: ', item.imgUrl);
                                newItems.push(item);
                            });
                        }
                        done();
                    });
                }
            }, function(err, results) {
                fs.writeFile('output.json', JSON.stringify(newItems), function(err){
                    console.log('File successfully written! - Check your project directory for the output.json file');
                });
                // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                res.send('File successfully written! - Check your project directory for the output.json file');
            });
            
            // To write to the system we will use the built in 'fs' library.
            // In this example we will pass 3 parameters to the writeFile function
            // Parameter 1 :  output.json - this is what the created filename will be called
            // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
            // Parameter 3 :  callback function - a callback function to let us know the status of our function
            
        }
    });

})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;