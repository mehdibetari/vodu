const fs = require('fs');

const copyPosterUrlFromTo = async (lang, destinationPath, froms) => {
    const topFile = await readFile(`.${destinationPath}/tops/${lang}.json`);
    const tops = JSON.parse(topFile);
    console.log('tops', lang, tops.length);
    tops.forEach(top => {
        const source = froms.find(from => from.id === top.id);
        top.posterUrl = source && source.posterUrl;
    });
    return tops;
};

const storeTopsPosters = (lang, destinationPath, items) => new Promise((resolve, reject) => {
    fs.writeFile(`.${destinationPath}/tops/${lang}.json`, JSON.stringify(items), { flag: 'w' }, function(err) {
        if(err) reject(err);
        console.log(`The ${lang} TOP file was up and saved!`);
        resolve();
    }); 
});

const readFile = filePath => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
});

const replaceUrl = async (langs, destinationPath, callback) => {
    const frFile = await readFile(`.${destinationPath}/tops/fr.json`);
    console.log('fr fetched');
    const french = await JSON.parse(frFile);
    console.log('fr json parsed');
    const frenchClear = await clearTops(french);
    console.log('fr cleared');

    for(const lang of langs) {
        const items = await copyPosterUrlFromTo(lang, destinationPath, frenchClear);
        const clearItems = await clearTops(items);
        console.log('clearItems', clearItems.length);
        await storeTopsPosters(lang, destinationPath, clearItems);
    }
    console.log('All replace done');
    callback();
}

const clearTops = items => new Promise(resolve => {
    resolve(items.map((item) => {
        if (item && item.offers) item.offers = undefined;
        if (item && item.all_titles) item.all_titles = undefined;
        if (item && item.tmdb_popularity) item.tmdb_popularity = undefined;
        return item;
    }));
});

module.exports.replaceUrl = replaceUrl;
