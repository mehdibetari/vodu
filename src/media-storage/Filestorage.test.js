const Filestorage = require('./Filestorage');
const configKeys   = require('../config-keys');
const AWS          = require('aws-sdk');

// const s3 = new AWS.S3({
//   accessKeyId: configKeys.S3.AWS_ACCESS_KEY,
//   secretAccessKey: configKeys.S3.AWS_SECRET_ACCESS_KEY
// });
// const BUCKET_NAME = 'media-store.tolookat.com';


let newStorage = new Filestorage();
const url = 'https://images-eu.ssl-images-amazon.com/images/I/41Ix1vMUK7L.png';
const fileName = 'super-image-2017.jpeg'
const filePath = `poster/1234test/`
newStorage.download(url, filePath, fileName, (response) => {
    console.log('RESPONSE', response);
});

// const s3params = {
//     Bucket: BUCKET_NAME,
//     MaxKeys: 20,
//     Delimiter: '/',
//     Prefix: 'poster/'
// };
// s3.listObjectsV2 (s3params, (err, data) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(data);
// });