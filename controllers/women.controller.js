const Woman = require("../models/women.model");
const Police = require("../models/user.model");

// Utility to calculate distance between 2 coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = degree => degree * (Math.PI / 180);
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ POST /women/womendata - Add woman and notify nearby police
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
      timestamp: new Date(),
      addedBy: req.user?.id || null
    });

    await newWoman.save();

    // ✅ Notify police if within 10km
    const allPolice = await Police.find({});

    for (const police of allPolice) {
      const pLat = police.location.latitude;
      const pLon = police.location.longitude;

      const distance = calculateDistance(latitude, longitude, pLat, pLon);

      if (distance <= 10) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB');
        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const notification = {
          woman: {
            name,
            latitude,
            longitude,
            date: formattedDate,
            time: formattedTime,
            distance: distance.toFixed(2) + " km"
          },
          nearestPolice: {
            stationName: police.stationName,
            latitude: pLat,
            longitude: pLon
          }
        };

        io.to(police._id.toString()).emit("woman-nearby", notification);
      }
    }

    res.status(201).json({ status: 201, message: "Woman added and nearby police notified." });

  } catch (err) {
    console.error("Error saving woman:", err);
    res.status(500).json({ error: "Failed to save woman data" });
  }
};

// ✅ GET /women/getwomennear/:policeId
exports.getWomenNearByPoliceStation = async (req, res) => {
  try {
    const { policeId } = req.params;

    const police = await Police.findById(policeId);
    if (!police || !police.location?.latitude || !police.location?.longitude) {
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
        const timestamp = new Date(woman.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-GB');
        const formattedTime = timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const womanData = {
          name: woman.name,
          latitude: lat,
          longitude: lon,
          date: formattedDate,
          time: formattedTime,
          distance: distance.toFixed(2) + " km"
        };

        nearbyWomen.push(womanData);

        // 🔔 Emit real-time notification to police socket room (optional here)
        io.to(policeId).emit("woman-nearby", {
          woman: womanData,
          nearestPolice: {
            stationName: police.stationName,
            latitude: policeLat,
            longitude: policeLon
          }
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
