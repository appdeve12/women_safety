const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  userId: String,
  fcmToken: String
});

module.exports = mongoose.model("UserToken", UserTokenSchema);
