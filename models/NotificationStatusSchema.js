const mongoose = require("mongoose");

const NotificationStatusSchema = new mongoose.Schema({
  notificationId: String,
  stationId: String,
  womanId: String,
  sentTo: String, // "primary" or "secondary"
  status: { type: String, enum: ["sent", "delivered"], default: "sent" },
  sentAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  deliveredBy: String 

  
});

module.exports = mongoose.model("NotificationStatus", NotificationStatusSchema);
