const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json'); // Tu archivo descargado de Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
