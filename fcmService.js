const admin = require("firebase-admin");
const serviceAccount = require("./mynotification-b3609-firebase-adminsdk-fbsvc-93a24cc8f3.json"); // download from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (token, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    token,
    data
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

module.exports = { sendNotification };
