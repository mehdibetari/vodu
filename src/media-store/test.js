let Store = require('./media-store');
let colors = require('colors');

new Store().then(function(instance){
    let mediaStore = instance;
    console.log(colors.green(JSON.stringify(mediaStore.getMediaByProp('name','Gerald\'s Game'))));
    console.log(colors.green(JSON.stringify(mediaStore.getMediaByProp('id',4846))));
    mediaStore.setMedia({id:'123',name:'toto'});
});

