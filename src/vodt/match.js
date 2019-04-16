const fs = require('fs');
const { getSeriePage } = require('./justWatch.provider');
const stringSimilarity = require('string-similarity');

const matchTopsAndShows = async (lang, sourceFile) => {
    let cpt = 0;
    const series = [];
    const dataRankFile = await readFile(sourceFile.rank);
    const listRankNetflixSeries = JSON.parse(dataRankFile);
    const dataNetflixSeries = await readFile(sourceFile.netflix);
    const listNetflixSeries = JSON.parse(dataNetflixSeries).items;

    for(const netflixRankedSerie of listRankNetflixSeries) {
        const ranked = cleanTitle(netflixRankedSerie.title);
        const matchedSerie = listNetflixSeries.find((netflixSerie) => {
            if (!netflixSerie.title) return false;
            //todo remove parentheses content
            return similarityTest(cleanTitle(netflixSerie.title), ranked) || similarityTest(cleanTitle(netflixSerie.original_title), ranked);
        });
        if (!matchedSerie) console.log('not match', netflixRankedSerie.title);
        if (matchedSerie) {
            cpt++;
            const serie = await getSeriePage(matchedSerie.id, lang);
            serie.scoring.push({ provider_type: 'allocine:popularity', value: netflixRankedSerie.ranking.popularite});
            serie.scoring.push({ provider_type: 'allocine:presse', value: netflixRankedSerie.ranking.presse});
            serie.scoring.push({ provider_type: 'allocine:spectateur', value: netflixRankedSerie.ranking.spectateur});
            serie.scoring.push({ provider_type: 'rank', value: netflixRankedSerie.ranking.rank});
            serie.scoring.push({ provider_type: 'variation', value: netflixRankedSerie.ranking.variation});
            serie.offers = undefined;
            serie.tmdb_popularity = undefined;
            series.push(serie);
            // console.log('matchedSerie', netflixRankedSerie.title, ' === ', matchedSerie.title);
        }
    }
    console.log('total', cpt, listRankNetflixSeries.length);
    return series;
};

const similarityTest = (text1, text2) => {
    return stringSimilarity.compareTwoStrings(text1, text2) > 0.80;
};

const cleanTitle = (title) => {
    return title.toLowerCase().split(/ *\([^)]*\) */g).join('').trim().replace('œ', 'oe');
};

const buildTops = async (lang, sourceFile, destinationPath) => {
    const series = await matchTopsAndShows(lang, sourceFile);
    if (!fs.existsSync(`.${destinationPath}/tops/`)) {
        fs.mkdirSync(`.${destinationPath}/tops/`, { recursive: true });
    }
    fs.writeFile(`.${destinationPath}/tops/${lang}.json`, JSON.stringify(series), { flag: 'w' }, function(err) {
        if(err) {
            return console.log('[match.js](L51)', err);
        }
        console.log(`[match.js](L53) The ${lang} TOP file was saved!`);
    }); 
};

const readFile = filePath => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
});

const match = async (langs, sourceFile, destinationPath, callback) => {
    for(const lang of langs) {
        await buildTops(lang, sourceFile, destinationPath);
    }
    callback();
}

module.exports.match = match;
