const mongoose = require("mongoose");

const WomanSchema = new mongoose.Schema({
  name: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
WomanSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Woman", WomanSchema);
