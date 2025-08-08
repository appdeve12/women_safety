const Woman = require("../models/women.model");
const Police = require("../models/user.model");
const admin = require("../fcmService"); // ✅ Import firebase admin
const NodeGeocoder = require('node-geocoder');
const { v4: uuidv4 } = require("uuid");
const NotificationStatus = require("../models/NotificationStatusSchema")


const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https', // <-- use HTTPS
  formatter: null
};

const geocoder = NodeGeocoder(options);
async function getAddress(lat, lon) {
  try {
    const res = await geocoder.reverse({ lat, lon });
    return res[0]?.formattedAddress || 'Unknown location';
  } catch (err) {
    console.error("Geocoding error:", err);
    return 'Unknown location';
  }
}


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

async function sendNotification(fcmToken, title, body, dataPayload = {}) {
  console.log("dataPayload", dataPayload)
  if (!fcmToken) return false;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: dataPayload

    });
    return true;
  } catch (err) {
    console.error("Error sending notification:", err.message);
    return false;
  }
}

exports.womendatapost = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const newWoman = await Woman.create({
      name,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    const locationName = await getAddress(latitude, longitude);
    const allPolice = await Police.find({});

    for (const police of allPolice) {
      const distance = calculateDistance(latitude, longitude, police.location.latitude, police.location.longitude);
      if (distance <= 10) {

        const notificationId = uuidv4();
        await NotificationStatus.create({
          usernotification: police._id,
          notificationId,
          stationId: police._id.toString(),
          womanId: newWoman._id.toString(),
          sentTo: "primary"
        });

        const payload = {

          notificationId,
          womanName: name,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          stationId: police._id.toString()
        };

        // 1️⃣ Send to Primary
        console.log(`📢 Sending to primary: ${police.phoneNumber} `);
        await sendNotification(police.fcmToken, `🚨 Emergency Alert: ${name}`, `📍 ${locationName}, Distance: ${distance.toFixed(2)} km `, {
          notificationId,
          womanName: name,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          stationId: police._id.toString()
        });

        // 2️⃣ Wait 10s for confirmation, then send to Secondary
        const RANK_ORDER = [
          'constable', 'iso', 'sho', 'asi', 'si', 'inspector',
          'dsp', 'acp', 'asp', 'sp', 'dcp', 'ssp', 'dig', 'adgp', 'dgp'
        ];

        setTimeout(async () => {
          console.log("⏳ Starting fallback by rank");

          const sortedSecondary = [...police.secondaryNumbers].sort(
            (a, b) => RANK_ORDER.indexOf(a.position) - RANK_ORDER.indexOf(b.position)
          );

          // Group officers by rank
          const groupedByRank = {};
          for (const officer of sortedSecondary) {
            if (!groupedByRank[officer.position]) {
              groupedByRank[officer.position] = [];
            }
            groupedByRank[officer.position].push(officer);
          }

          for (const rank of RANK_ORDER) {
            const officersInRank = groupedByRank[rank];
            if (!officersInRank || officersInRank.length === 0) continue;

            console.log(`📣 Notifying rank: ${rank}`);

            for (const sec of officersInRank) {
              if (sec.fcmToken) {
                await sendNotification(
                  sec.fcmToken,
                  `🚨 Emergency Alert (Fallback - ${rank}): ${name}`,
                  `📍 ${locationName}, Distance: ${distance.toFixed(2)} km `,
                  {
                    notificationId,
                    womanName: name,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    stationId: police._id.toString()
                  }
                );
              }
            }

            // ⏳ Wait 30 seconds before moving to next rank
            await new Promise(resolve => setTimeout(resolve, 30000));

            // ✅ Check if someone has accepted
            const statusRecord = await NotificationStatus.findOne({
              notificationId,
              stationId: police._id.toString()
            });

            if (statusRecord?.status === 'delivered') {
              console.log(`✅ Delivered by rank: ${rank}. Stopping further notifications.`);
              break;
            } else {
              console.log(`❌ No delivery at rank: ${rank}. Moving to next...`);
            }
          }
        }, 30000); // Initial 30s wait before starting fallback


      }
    }

    res.status(201).json({ status: 201, message: "Woman added and notifications sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save woman data" });
  }
};


// ✅ GET /women/getwomennear/:policeId

exports.getWomenNearByPoliceStation = async (req, res) => {
  try {
    const policeId = req.user.id;
    const { phoneNumber } = req.query; // ✅ passed from frontend

    const police = await Police.findById(policeId);
    if (!police) {
      return res.status(404).json({ error: "Police station not found" });
    }

    const isSecondary = police.secondaryNumbers.some(sec => sec.number === phoneNumber);

    const policeLat = police.location.latitude;
    const policeLon = police.location.longitude;

    const women = await Woman.find({});
    const nearbyWomen = [];

    for (const woman of women) {
      const [lon, lat] = woman.location.coordinates;
      const distance = calculateDistance(lat, lon, policeLat, policeLon);

      if (distance <= 10) {
        const notificationIdRecord = await NotificationStatus.findOne({
          stationId: police._id.toString(),
          womanId: woman._id.toString()
        });

        const isDelivered = notificationIdRecord?.status === 'delivered';

        // ✅ Skip if secondary and already delivered
        if (isSecondary && isDelivered) continue;

        const timestamp = new Date(woman.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-GB');
        const formattedTime = timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        nearbyWomen.push({
          name: woman.name,
          latitude: lat,
          longitude: lon,
          date: formattedDate,
          time: formattedTime,
          distance: distance.toFixed(2) + " km",

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
      nearbyWomen,
      filePath: "/uploads/file-1754562859685.mp3"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby women" });
  }
};
