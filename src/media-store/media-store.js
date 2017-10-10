'use strict';
let fs = require('fs');
let colors = require('colors');

class MediaStore {

    constructor() {
        console.log('Constructor');
        this.MEDIA_STORE_FILE = '/media-store.json';
        this.STORE_FOLDER = './store';
        return new Promise((resolve) => {
            this.getStoreFile((result) => {
                console.log('Store fetch done');
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
        this.store.push(media);
        this.saveStore();
    }

    saveStore() {
        fs.writeFile(this.STORE_FOLDER + this.MEDIA_STORE_FILE, JSON.stringify({ items: this.store}), function(err){
            console.log(colors.bgGreen.white('Store successfully written!'));
        });
    }
}
module.exports =  MediaStore;