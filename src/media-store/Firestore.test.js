let Firestore = require('./Firestore');
const mediaTest = {
    'actors' : 'Carla Gugino, Bruce Greenwood, Henry Thomas...',
    'category' : [ {
        'from' : 'netflix-upcomings',
        'value' : 'Only On Netflix'
    } ],
    'creators' : 'Stephen King',
    'directors' : 'Mike Flanagan',
    'identifier' : [ {
        'from' : 'netflix-upcomings',
        'value' : 1234
    }, {
        'from' : 'imdb',
        'value' : 'tt3748172'
    } ],
    'mediaLink' : [ {
        'from' : 'netflix-upcomings',
        'value' : '/fr/only-on-netflix/171187'
    }, {
        'from' : 'imdb',
        'value' : '/title/tt3748172/?ref_=fn_al_tt_1'
    } ],
    'name' : 'moviename',
    'poster' : [ {
        'originalUrl' : 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTk1NDQ3NzY1Ml5BMl5BanBnXkFtZTgwMzM4ODc0MzI@._V1_UY268_CR1,0,182,268_AL_.jpg',
        'priority' : 1,
        'url' : 'https://ucarecdn.com/e122f0e9-0d11-415b-af3e-45114a6fe97e/Geraldsgame2017.jpg'
    } ],
    'premiereDate' : '29 septembre 2017',
    'sortDate' : '2017-09-29',
    'summary' : [ {
        'from' : 'netflix-upcomings',
        'value' : 'When the patriarch of a prominent family dies, his heirs battle to determine who will gain control of his beloved soccer team: The Cuervos of Nuevo Toledo'
    }, {
        'from' : 'imdb',
        'value' : 'While trying to spice up their marriage in their remote lake house, Jessie must fight to survive when her husband dies unexpectedly, leaving her handcuffed to their bed frame.'
    } ],
    'type' : 'movie',
    'year': 'year',
    'slug': 'moviename+year'
};
let mediaStore = new Firestore();
// mediaStore.getMedia(mediaTest, function(response, error){
//     console.log('GET error: ', error, 'response', response);
//     if (error) {
//         mediaStore.setMedia(mediaTest, function(error){
//             console.log('SET0 error: ', error);
//         });
//     }
//     else {
//         mediaTest.name = 'newMovie';
//         mediaStore.setMedia(mediaTest, function(error){
//             console.log('SET1 error: ', error);
//             mediaTest.summary[0].value = 'new desc3';
//             mediaStore.setMedia(mediaTest, function(error){
//                 console.log('SET2 error: ', error);
//             });
//         });
//     }
// });
// mediaStore.cgetMedia(function(response, error){
//     console.log('CGET error: ', error, response);
// });
// mediaStore.removeMedia(mediaTest, function(response, error){
//     console.log('REMOVE error: ', error, response);
// });

/** Test with formated media in Media class*/
let Media = require('./Media');
const orginalUpcomingMedia = {
    'id': 170936,
    'categoryId': 'titles',
    'category': 'Only On Netflix',
    'name': 'Long Shot',
    'description': '',
    'runTime': '',
    'type': 'documentary',
    'distribution': 'global',
    'distributionComments': '',
    'specialFormats': '',
    'premiereDate': '29 septembre 2017',
    'seasons': null,
    'uri': '/fr/only-on-netflix/170936',
    'locale': 'fr',
    'sortDate': '2017-09-29',
    'actors': 'Juan Catalan, Larry David, Robert Gajic...',
    'directors': 'Jacob LaMendola...',
    'creators': '',
    'posterUrl': 'https://images-na.ssl-images-amazon.com/images/M/MV5BMDQ2YjZkZjgtYThkYy00ODIxLTkzOGQtN2QxNTVmYWVhYjY2XkEyXkFqcGdeQXVyMjYyMDQwMDQ@._V1_UX182_CR0,0,182,268_AL_.jpg',
    'mediaLink': '/title/tt7344360/?ref_=fn_al_tt_1',
    'summary': 'When Juan Catalan is arrested for a murder he insists he didn|\'t commit, he builds his case for innocence around raw footage from a popular TV show, \'Curb Your Enthusiasm.\'',
    'localPath': 'https://ucarecdn.com/4a746940-46ed-4832-adb0-51490f3160ca/MV5BMDQ2YjZkZjgtYThkYy00ODIxLTkzOGQtN2QxNTVmYWVhYjY2XkEyXkFqcGdeQXVyMjYyMDQwMDQ_V1_UX182_CR00182268_AL_.jpg',
};
const mediaFrom = 'netflix-upcomings';
let newMedia = new Media(orginalUpcomingMedia, mediaFrom);
mediaStore.setMedia(newMedia, function(error){
    console.log('SET0 error: ', error);
});
