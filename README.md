# node-server

you need to add src/config-keys.js

```javascript
const keys = {
    'uploadcare': {
        'public_key': 'yourpublickey',
        'private_key': 'yourprivatekey'
    }
};
exports.uploadcare = keys.uploadcare;
```