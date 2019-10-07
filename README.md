VODU - Video On Demand Upcomings
=====
[nodejs-server] [nodejs-scrapper]


This project scrape for you Upcomings series and movies provided by a famous VOD provider and serve result on a responsive website.

[Demo](http://alloserie.fr)

You need two third party API account (freemium): UPLOADCARE & FIREBASE to store Posters and already scraped media.

[[Uploadcare-node](https://github.com/RexMorgan/uploadcare-node)]
[[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup/)]

## Getting started

### Step 0 : NodeJS is required >= v6.9.1 on your system

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
![PROMPT-MODE](http://alloserie.fr/images/terminal-refresh-upcomings-screenshot.png)

You can also use prompt mode to add manualy a poster url does not founded by the scraper.
```
node src/refresh-upcoming.js --prt
```
![PROMPT-MODE](http://alloserie.fr/images/terminal-refresh-upcomings-prompt-mode.png)

By default posters are localy downloaded on `/public/posters` folder use option `--uploadcare` to store posters in

```
node src/refresh-upcoming.js --upc
```

### Run the web server
On production it run on port 80
```
node src/server.js
```

Localy
```
node src/server.js --dev
```
Go to localhost:8888

