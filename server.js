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
