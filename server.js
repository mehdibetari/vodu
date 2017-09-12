var express = require('express');
var app     = express();

app.get('/scrape', function(req, res){
    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    res.send('File successfully written! - Check your project directory for the netflix-upcoming.json file');
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;