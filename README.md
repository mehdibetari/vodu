![VODMU](http://alloserie.fr/images/calendrier-netflix@2x.jpg)
VODU - Video On Demand Upcomings
=====
[nodejs-server] [nodejs-scrapper]


This project scrape for you Upcomings series and movies provided by a famous VOD provider and serve result on a responsive website.

[Demo](http://alloserie.fr)

You need two third party API account (freemium): UPLOADCARE & FIREBASE to store Posters and already scraped media.

## Getting started

### Step 1 : Set your API credentials for Uploadcare
```
touch src/config-keys.js
```
Copy the snippet below, and set your own keys
```javascript
const keys = {
    'uploadcare': {
        'public_key': 'yourpublickey',
        'private_key': 'yourprivatekey'
    }
};
exports.uploadcare = keys.uploadcare;
```

### Step 2 : Set your API credentials for Firebase
```
touch src/media-store/firebase-key.json
```
and copy your firebase key json file, uploaded on firebase console (settings => service accounts => adminsdk => generate a new private key)

### Step 3 : Create posters folder
```
mkdir public/posters
```

### Step 4 : Install project dependencies
```
npm install
```

## How to use
### Scrape Upcomings, Posters and meta

```
node src/refresh-upcoming.js
```
### Run the web server
On production it run on port 80
```
node src/server.js
```

Localy
```
node src/server.js --env=dev
```
Go to localhost:8888


