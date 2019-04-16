const fs = require('fs');
const Slug = require('slugify');
const Store = require('./Filestore');
const BASE_URL = 'https://images.justwatch.com';

const savePostersAndUpdateFile = async (lang, awskeys) => {
    const topFile = await readFile(`./tops/${lang}.json`);
    const tops = JSON.parse(topFile);

    for(const top of tops) {
        const slug = top.full_path ? top.full_path.replace(`/${lang}/serie/`, '') : Slug(top.original_title, { lower: true, remove: /[$*_+~.()'"!?\:@/,]/g  });;
        const url = top.poster.replace('{profile}', `s332/${slug}`)
        const destinationPath = `posters/${top.id}/`;
        const destinationFileName = `${slug}.jpeg`;
        const options = {
            AWS_ACCESS_KEY: awskeys.S3.AWS_ACCESS_KEY,
            AWS_SECRET_ACCESS_KEY: awskeys.S3.AWS_SECRET_ACCESS_KEY,
            AWS_BUCKET_NAME: 'cf-simple-s3-origin-cloudfrontfors3-642578718534',
            AWS_CF_BASE_URL: 'd1sygdf8atpyev.cloudfront.net'
        };
        top.posterUrl = await Store({sourceUrl: BASE_URL + url, destinationPath, destinationFileName, options});
    }
    return tops;
};

const storeTopsPosters = async (lang, destinationPath, awskeys) => {
    const series = await savePostersAndUpdateFile(lang, awskeys);
    fs.writeFile(`.${destinationPath}/tops/${lang}.json`, JSON.stringify(series), { flag: 'w' }, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log(`The ${lang} TOP file was saved!`);
    }); 
};

const readFile = filePath => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
});

const storePosters = async (langs, destinationPath, awskeys, callback) => {
    for(const lang of langs) {
        await storeTopsPosters(lang, destinationPath, awskeys);
    }
    callback();
}

module.exports.storePosters = storePosters;
