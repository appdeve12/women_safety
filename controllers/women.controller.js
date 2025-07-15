const Woman = require("../models/women.model");
exports.womendatapost= async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing data" });
    }

    const newWoman = new Woman({
      name,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // GeoJSON order
      }
    });

    await newWoman.save();
    res.status(200).json({status:200, message: "Woman data saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save woman data" });
  }
}

exports.getwomendata= (req, res) => {
  const womenData = [
    {
      name: "Radha Sharma",
      location: {
        latitude: 26.8467,
        longitude: 80.9462
      },
      timestamp: new Date()
    },
    {
      name: "Pooja Verma",
      location: {
        latitude: 28.7041,
        longitude: 77.1025
      },
      timestamp: new Date()
    },
    {
      name: "Sita Yadav",
      location: {
        latitude: 25.3176,
        longitude: 82.9739
      },
      timestamp: new Date()
    }
  ];

  res.json(womenData);
}

const Police = require("../models/user.model");
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = degree => degree * (Math.PI / 180);
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // return raw number, format later
}

exports.getWomenWithNearestPolice = async (req, res) => {
  try {
    const women = await Woman.find({});
    const policeStations = await Police.find({});

    const results = women.map(woman => {
      const [longitude, latitude] = woman.location.coordinates;

      const distances = policeStations.map(police => {
        const { latitude: policeLat, longitude: policeLon } = police.location;

        const distance = calculateDistance(latitude, longitude, policeLat, policeLon);

        return {
          policeId: police._id,
          stationName: police.stationName,
          distance: distance.toFixed(2) + " km"
        };
      });

      distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  
      let formattedDate = null;
      let formattedTime = null;
      if (woman.timestamp) {
        const dateObj = new Date(woman.timestamp);
        formattedDate = dateObj.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
        formattedTime = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }); // Format: 10:00 AM
      }

      return {
        status: 200,
        woman: {
          name: woman.name,
          latitude,
          longitude,
          date: formattedDate,
          time: formattedTime
        },
        nearestPolice: distances[0]
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate distances" });
  }
};
