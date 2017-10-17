'use strict';

let Media = require('./Media');
let mediaFrom = 'netflix-upcomings';
let orginalUpcomingMedia = {
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

let newMedia = new Media(orginalUpcomingMedia, mediaFrom);
console.log(newMedia);