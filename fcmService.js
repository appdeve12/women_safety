// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./woman-safety-c2b87-firebase-adminsdk-fbsvc-57205f76a9.json"); // Make sure path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
