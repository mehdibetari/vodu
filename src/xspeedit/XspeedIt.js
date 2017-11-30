const prompt   = require('prompt');
const asciify  = require('asciify');
const Packager = require('./XspeedIt');

init();

/**
 * run terminal interface XspeedIt AND
 * call prompt methode
 */
function init () {
    asciify('XspeedIt', {font:'colossal', color:'magenta'},function(err, res){ 
        console.log(res);
        Xprompt();
    });
}

/**
 * run prompt AND
 * call packaging when ENTER is trigger
 */
function Xprompt () {
    prompt.start();
    prompt.message = 'Enter the chain';
    prompt.get(['items'], function (err, result) {
        if (result) {
            packaging(result.items);
        }
    });
}

/**
 * call XspeedIt to get boxes packaging AND
 * re-run a prompt if items exist
 * @param {string} items 
 */
function packaging (items) {
    const session = new Packager(items);
    console.log(session.getBoxes().join('/'), ' count ', session.getBoxes().length, '\r\n ');
    if (items) Xprompt();
}