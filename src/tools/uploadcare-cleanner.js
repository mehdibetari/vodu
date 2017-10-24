const configKeys = require('../config-keys');
let fs           = require('fs');
let request      = require('request');
let uploadcare   = require('uploadcare')(configKeys.uploadcare.public_key, configKeys.uploadcare.private_key);
let Firestore    = require('../media-store/Firestore');
let prompt       = require('prompt');

//Paginated list of files/groups info
const maxLimit = 1000;
let mediaStore = new Firestore();
let cpt = 0;
let filesToRemove = [];
uploadcare.files.list({page: 1, limit: maxLimit}, function(error,response){
    console.log('Uploadcare Files: ',response.total);
    if (response && response.total > 0) {
        mediaStore.cgetMedia(function(mediaList, error) {
            if (!mediaList || error) return console.log('Error to fetch Firebase');
            console.log('Media list length: ',Object.keys(mediaList).length);
            if (response.total <= maxLimit) {
                response.results.forEach(function(file){
                    const fileUrl = file.original_file_url;
                    const mediaExist = searchMediaByFileUrl(mediaList, fileUrl);
                    if (!mediaExist) {
                        //remove file
                        filesToRemove.push(file.uuid);
                        cpt++;
                    }
                });
                console.log('Media to remove: ', cpt);
                if (filesToRemove.length > 0) {
                    prompt.start();
                    prompt.message = 'Confirm remove all ' + cpt + ' files ? (yes/no)';
                    prompt.get(['remove'], function (err, result) {
                        if (result.remove === 'yes') {
                            filesToRemove.forEach(function(uuid) {
                                uploadcare.files.remove(uuid, function(error, response){
                                    console.log(error, response);
                                });
                            });
                        }
                    });
                }

            }
            else {
                console.log('More than 1000 file on Firestore');
            }
        });
    }
    else {
        console.log('No files on UPC');
    }
});

function searchMediaByFileUrl (mediaList, fileUrl) {
    let founded = false;
    // console.log('###UPLOADCARE URL ',fileUrl);
    Object.keys(mediaList).forEach(function(media) {
        if (!founded) {
            var url = getDataFrom('own-cloud-storage', mediaList[media].poster);
            // console.log('Url to match',url, fileUrl === url);
            founded = fileUrl === url;
        }
    });
    return founded;
}

function getDataFrom(from, Datas = []) {
    if (!~Datas.length) return '';
    var Data = Datas.filter(data => data.from === from);
    if (!Data[0] || !Data[0].value) return '';
    return Data[0].value || '';
}