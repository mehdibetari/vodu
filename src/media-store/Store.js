'use strict';
let fs = require('fs');
let colors = require('colors');
const uuidv1 = require('uuid/v1');

class Store {

    constructor() {
        this.MEDIA_STORE_FILE = '/media-store.json';
        this.STORE_FOLDER = './store';
        return new Promise((resolve) => {
            this.getStoreFile((result) => {
                this.store = result.items;
                resolve(this);
            });
        });
    }
    
    getStoreFile(callback) {
        if (fs.existsSync(this.STORE_FOLDER + this.MEDIA_STORE_FILE)) {
            fs.readFile(this.STORE_FOLDER + this.MEDIA_STORE_FILE, 'utf8', function (error,netflixUpcomingStore) {
                if (error)  {
                    console.log('!!! ERROR on read file '+ this.STORE_FOLDER + this.MEDIA_STORE_FILE + '\n ###ErrorLogStart### ' + error+ '\n ###ErrorLogEnd### ')
                    callback(false);
                }        
                callback(JSON.parse(netflixUpcomingStore));
            });
        }
        else {
            callback({});
        }
    }
    
    getMediaByProp(prop, value) {
        console.log('getMediaByProp',prop, value);
        return this.store.filter(function(item){
            return item[prop] === value;
        });
    }

    setMedia(media) {
        if (media.uuid && this.getMediaByProp('uuid', media.uuid)) {
            this.putMedia(media, function(success){
                if (success) {
                    console.log(colors.bgGreen.white('Media Succefully updated'));
                }
                else {
                    console.log(colors.bgRed.white('Media Failed updated'));
                }
            });
        }
        else {
            this.postMedia(media, function(success){
                if (success) {
                    console.log(colors.bgGreen.white('Media Succefully added'));
                }
                else {
                    console.log(colors.bgRed.white('Media Failed added'));
                }
            });
        }
    }

    postMedia(media, callback) {
        media.uuid = uuidv1();
        this.store.push(media);
        this.saveStore(function(err){
            callback(!err);
        });
    }

    putMedia(media) {
        const mediaIndex = this.store.findIndex(function(item){
            return item.uuid === media.uuid;
        });
        if (~mediaIndex) {
            this.store[mediaIndex] = media;
            this.saveStore(function(err){
                callback(!err);
            });    
        }
        else {
            callback(false);
        }
    }

    saveStore(callback) {
        fs.writeFile(this.STORE_FOLDER + this.MEDIA_STORE_FILE, JSON.stringify({ items: this.store}), function(err){
            console.log(colors.bgGreen.white('Store successfully written!'));
            callback(err);
        });
    }
}
module.exports =  Store;