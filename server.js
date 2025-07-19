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
