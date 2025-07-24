// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("/etc/secrets/woman-safety-c2b87-firebase-adminsdk-fbsvc-b332de8750.json"); // Make sure path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
