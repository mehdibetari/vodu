
const argv      = require('yargs').argv;
const upcomings = require('./src/refresh-upcoming');

init();

/**
 * run terminal interface XspeedIt AND
 * call prompt methode
 */
function init () {
    const prompt = argv.prt;
    const uploadcare = argv.upc;
    upcomings(uploadcare, prompt);
}