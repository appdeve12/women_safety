// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./mynotification-b3609-firebase-adminsdk-fbsvc-93a24cc8f3.json"); // Make sure path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
