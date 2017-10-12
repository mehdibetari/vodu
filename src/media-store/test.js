let Store = require('./Store');
let colors = require('colors');
let media = {
    "id": 4846,
    "categoryId": "titles",
    "category": "Only On Netflix",
    "name": "Club De Cuervos",
    "description": "",
    "runTime": "",
    "type": "series",
    "distribution": "global",
    "distributionComments": "",
    "specialFormats": "",
    "premiereDate": "29 septembre 2017",
    "seasons": 2,
    "uri": "/fr/only-on-netflix/4846",
    "locale": "fr",
    "sortDate": "2017-09-29",
    "actors": "Luis Gerardo Méndez, Mariana Treviño, Stephanie Cayo...",
    "directors": "",
    "creators": "Gary Alazraki, Michael Lam...",
    "posterUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTk1NDQ3NzY1Ml5BMl5BanBnXkFtZTgwMzM4ODc0MzI@._V1_UY268_CR1,0,182,268_AL_.jpg",
    "mediaLink": "/title/tt4680240/?ref_=fn_al_tt_1",
    "summary": "\n                    When the patriarch of a prominent family dies, his heirs battle to determine who will gain control of his beloved soccer team: The Cuervos of Nuevo Toledo.\n            ",
    "localPath": "https://ucarecdn.com/080267c0-08c7-4368-9510-653491e07033/MV5BMTk1NDQ3NzY1Ml5BMl5BanBnXkFtZTgwMzM4ODc0MzI_V1_UY268_CR10182268_AL_.jpg"
};
new Store().then(function(MediaStore){
    // console.log(colors.green(JSON.stringify(MediaStore.getMediaByProp('name','Gerald\'s Game'))));
    // console.log(colors.green(JSON.stringify(MediaStore.getMediaByProp('id',4846))));
    MediaStore.setMedia(media);
});

