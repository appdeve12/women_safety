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
  },

  secondaryNumbers: [
    {
      number: { type: String, required: true },
      position: {
        type: String,
        enum: ['sp', 'asp', 'dsp', 'inspector', 'si', 'asi', 'sho', 'iso', 'constable'],
        required: true
      }
    }
  ],
  fcmToken: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("Police", PoliceSchema);
