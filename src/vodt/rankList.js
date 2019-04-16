const fs = require('fs');
const { getSeriePage } = require('./allocine.provider');

let series = [];
const MAX_PAGE = 400; //414
const pages = Array.apply(null, Array(MAX_PAGE)).map(function (x, i) { return i + 1; });

const buildAllocineNetflixRankList = async () => await processPages(pages);
const processPages = async (pages) => {
    for(const pageNum of pages) {
        const pageSeries = await getSeriePage(pageNum);
        console.log(`      - series fetched ${pageSeries.length}`);
        series = series.concat(pageSeries);
        console.log(`      - subtotal fetched ${series.length}`);
    }
    console.log(`TOTAL fetched ${series.length}`);
    return series;
}
const buildRankList = async (sourceFile, callback) => {
    const list = await buildAllocineNetflixRankList();
    const previousList = await readFile(sourceFile);
    const mergedList = await improveListWithVariation(list, JSON.parse(previousList));
    fs.writeFile(sourceFile, JSON.stringify(mergedList), { flag: 'w' }, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("[ALLOCINE TOPS FILE] was saved!");
        callback();
    }); 
};

const improveListWithVariation = (current, previous) => {
    return current.map(currentShow => {
        const show = previous.find(previousShow => currentShow.title === previousShow.title);
        if (!show) return currentShow;
        if (show.ranking.popularite > currentShow.ranking.popularite) currentShow.ranking.variation = 'up';
        if (show.ranking.popularite < currentShow.ranking.popularite) currentShow.ranking.variation = 'down';            
        return currentShow;
    });
};

const readFile = filePath => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
});

module.exports.buildRankList = buildRankList;
