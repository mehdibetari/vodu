# node-server

touch src/config-keys.js

```javascript
const keys = {
    'uploadcare': {
        'public_key': 'yourpublickey',
        'private_key': 'yourprivatekey'
    }
};
exports.uploadcare = keys.uploadcare;
```

touch src/media-store/firebase-key.json
and copy your firebase key file