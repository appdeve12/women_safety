const Woman = require("../models/women.model");
const Police = require("../models/user.model");


// POST /womendata - Add woman record
exports.womendatapost = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing data" });
    }

    const newWoman = new Woman({
      name,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      timestamp: new Date(), // Save timestamp
      addedBy: req.user?.id || null // Optional: if using auth middleware
    });

    await newWoman.save();
    res.status(200).json({ status: 200, message: "Woman data saved successfully" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save woman data" });
  }
};


function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = degree => degree * (Math.PI / 180);
  const R = 6371; // Earth's radius in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /getwomennear/:policeId
exports.getWomenNearByPoliceStation = async (req, res) => {
  try {
    const { policeId } = req.params;

    // Find the police station by ID
    const police = await Police.findById(policeId);
    if (!police || !police.location || !police.location.latitude || !police.location.longitude) {
      return res.status(404).json({ error: "Police station not found or missing coordinates" });
    }

    const policeLat = police.location.latitude;
    const policeLon = police.location.longitude;

    const women = await Woman.find({});
    const nearbyWomen = [];

    for (const woman of women) {
      const [lon, lat] = woman.location.coordinates;

      const distance = calculateDistance(lat, lon, policeLat, policeLon);

      if (distance <= 10) {
        let formattedDate = null;
        let formattedTime = null;
        if (woman.timestamp) {
          const dateObj = new Date(woman.timestamp);
          formattedDate = dateObj.toLocaleDateString('en-GB');
          formattedTime = dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }

        nearbyWomen.push({
          name: woman.name,
          latitude: lat,
          longitude: lon,
          date: formattedDate,
          time: formattedTime,
          distance: distance.toFixed(2) + " km"
        });
      }
    }

    res.status(200).json({
      status: 200,
      police: {
        id: police._id,
        stationName: police.stationName,
        latitude: policeLat,
        longitude: policeLon
      },
      nearbyWomen
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby women" });
  }
};
