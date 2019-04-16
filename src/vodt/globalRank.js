const fs = require('fs');

const addGlobalRank = async (sourceFile, callback) => {
    const dataRankFile = await readFile(sourceFile);
    const listRankNetflixSeries = JSON.parse(dataRankFile);

    const list = listRankNetflixSeries.map((show, index) => {
        show.ranking.rank = index + 1;
        return show;
    });
    // console.log('list', list);
    fs.writeFile(sourceFile, JSON.stringify(list), { flag: 'w' }, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("[ALLOCINE GLOBAL RANK FILE] was added and saved!");
        callback();
    });
};

const readFile = filePath => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
});

module.exports.addGlobalRank = addGlobalRank;
