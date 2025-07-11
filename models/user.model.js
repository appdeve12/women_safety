const mongoose = require("mongoose");
const PoliceSchema = new mongoose.Schema({
    state: String,
    district: String,
    stationName: String,
    phoneNumber: { type: String, unique: true },
    password: String,
    location: {
        latitude: Number,
        longitude: Number
    }
})
module.exports = mongoose.model("Police", PoliceSchema);