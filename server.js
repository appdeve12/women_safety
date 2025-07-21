const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
global.io = io;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Data Connected Successfully"))
  .catch(() => console.log("Database Not Connected"));

const userRoutes = require("./routes/user.route");
const womenRoutes = require("./routes/women.route");

app.use("/user", userRoutes);
app.use("/women", womenRoutes);

// ✅ Socket.IO connection
io.on("connection", (socket) => {
  console.log("🚔 New socket connected:", socket.id);

  socket.on("joinPoliceRoom", (policeId) => {
    socket.join(policeId);
    console.log(`👮 Police ${policeId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config();

// const { sendNotification } = require("./fcmService");
// const UserToken = require("./models/UserToken");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// // Save FCM Token
// app.post("/save-token", async (req, res) => {
//   const { userId, token } = req.body;
//   try {
//     await UserToken.findOneAndUpdate({ userId }, { fcmToken: token }, { upsert: true });
//     res.send({ success: true });
//   } catch (err) {
//     res.status(500).send({ success: false, error: err });
//   }
// });

// // Send Notification
// app.post("/notify", async (req, res) => {
//   const { userId, title, body } = req.body;
//   try {
//     const user = await UserToken.findOne({ userId });
//     if (user && user.fcmToken) {
//       await sendNotification(user.fcmToken, title, body);
//       res.send({ success: true });
//     } else {
//       res.status(404).send({ success: false, message: "Token not found" });
//     }
//   } catch (err) {
//     res.status(500).send({ success: false, error: err });
//   }
// });

// app.listen(3000, () => console.log("Server running on port 3000"));
// // {
// //   "userId": "user123",
// //   "title": "Hello!",
// //   "body": "This is a live push notification!"
// // }
