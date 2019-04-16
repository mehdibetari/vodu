const fs = require('fs');
const path = require('path');
const { getSeriesList } = require('./justWatch.provider');
const { buildRankList } = require('./rankList');
const { addGlobalRank } = require('./globalRank');
const { match } = require('./match');
const { storePosters } = require('./storePosters');
const { replaceUrl } = require('./replaceUrl');
const tvShowsFile = path.resolve(__dirname, './FR-netflix-tv-shows.json');
const showsRankFile = path.resolve(__dirname, './FR-allocine-tv-tops.json');

const run = async ({ destinationPath, awskeys }) => {
    // 1 Fetch justwatch list and copy to FR-netflix-tv-shows.json
    const series = await getSeriesList();
    const folder = destinationPath ? destinationPath : '';
    fs.writeFile(tvShowsFile, JSON.stringify(series), { flag: 'w' }, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log(`[JUSTWATCH NETFLIX SHOWS FILE] was saved!`);
        buildRankList(showsRankFile, () => {
            addGlobalRank(showsRankFile, () => {
                match(['fr', 'en', 'de', 'es', 'pt'], { netflix: tvShowsFile, rank: showsRankFile }, folder, () => {
                    storePosters(['fr', 'en', 'de', 'es', 'pt'], folder, awskeys, () => {
                        replaceUrl(['en', 'de', 'es', 'pt'], folder, () => {
                            console.log('-- COMPLETED --');
                        });
                    });
                });
            });
        });
    });
}

module.exports.run = run;
