const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Database Connected Successfully"))
.catch((err) => {
  console.error("❌ Database Connection Error:", err.message);
  process.exit(1);
});

// Routes
const userRoutes = require("./routes/user.route");
const womenRoutes = require("./routes/women.route");

app.use("/user", userRoutes);
app.use("/women", womenRoutes);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

// File upload endpoint
app.post("/uploadfile", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});
app.get("/uploadedfiles/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  res.sendFile(filePath);
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



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