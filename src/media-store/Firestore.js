'use strict';

let admin = require('firebase-admin');
let serviceAccount = require('./firebase-key.json');

class Firestore {

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://alloserie-986c3.firebaseio.com'
        });
        this.db = admin.database();
        this.ref = this.db.ref("server");
        this.mediaRef = this.ref.child("media");
    }
    getMedia(media, callback) {
        this.mediaRef.child(media.slug).once('value', (snapshot) => {
            let err = (snapshot.val()) ? false : true;
            callback(snapshot.val(), err);
        }, function (errorObject) {
            console.log('Firestore | getMedia => Failed | error code : ' + errorObject.code);
            callback(errorObject, true);
        });
    }
    cgetMedia(callback) {
        this.mediaRef.once('value', (snapshot) => {
            callback(snapshot.val(), false);
        }, function (errorObject) {
            console.log('Firestore | cgetMedia => Failed | error code : ' + errorObject.code);
            callback(errorObject, true);
        });
    }
    setMedia(media, callback) {
        let mediaAlreadyExist = false;
        this.getMedia(media, (result, err) => {
            if(!err && result) {
                const identifierAlreadyExist = result.identifier && result.identifier.length > 0;
                const propsMatch = result.name === media.name && result.year === media.year;
                mediaAlreadyExist = (identifierAlreadyExist && propsMatch) ? true : false;
            }
            if (mediaAlreadyExist) {
                this.putMedia(media, (err) => {
                    callback(err);
                });
            }
            else {
                this.postMedia(media, (err) => {
                    callback(err);
                });
            }
        });
    }
    postMedia(media, callback) {
        this.mediaRef.child(media.slug).set(media, function(err){
            callback(err);
        });
    }
    putMedia(media, callback) {
        this.mediaRef.child(media.slug).update(media, function(err){
            callback(err);
        });
    }
    removeMedia(media, callback) {
        this.mediaRef.child(media.slug).remove(function(err){
            callback(err);
        });
    }
}
module.exports =  Firestore;