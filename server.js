const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Data Connected Successfully"))
  .catch(() => console.log("Database Not Connected"));

const userRoutes = require("./routes/user.route");
const womenRoutes = require("./routes/women.route");

app.use("/user", userRoutes);
app.use("/women", womenRoutes);



app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);


// fRBy8lleTWOCEetYyb7elg:APA91bEcR9VidQSf739WJXdnr5S_TqSso9wechS8VRS-R1cQLQgDyTxYFue6hRNg5pDeIEgQSHByHFPDpyJWAvhoC8EaXWfJbSBP7n5ClL3WjsCX0FkKXSU

// const admin = require("firebase-admin");
// const serviceAccount = require("./woman-safety-c2b87-firebase-adminsdk-fbsvc-57205f76a9.json");

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// // Notification sending function
// const sendPushNotification = async (fcmToken, title, body) => {
//   const message = {
//     notification: {
//       title: title,
//       body: body,
//     },
//     token: fcmToken,
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log("✅ Notification sent successfully:", response);
//   } catch (error) {
//     console.error("❌ Error sending notification:", error);
//   }
// };

// // Example usage
// const fcmToken = "fRBy8lleTWOCEetYyb7elg:APA91bEcR9VidQSf739WJXdnr5S_TqSso9wechS8VRS-R1cQLQgDyTxYFue6hRNg5pDeIEgQSHByHFPDpyJWAvhoC8EaXWfJbSBP7n5ClL3WjsCX0FkKXSU"; // Copy from browser console
// sendPushNotification(fcmToken, "🚨 Test Notification", "Hello from Node.js server!");