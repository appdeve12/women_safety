const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/user.controller");
const authMiddleware = require("../auth/authmiddleware");
const Police = require("../models/user.model"); // ✅ Add this line

router.post('/register', usercontroller.Police_Register);
router.post('/login', usercontroller.Police_Login);
router.get('/alluser', usercontroller.All_login);
router.post('/update-location', authMiddleware, usercontroller.Update_Location);
router.post("/confirm-notification", async (req, res) => {
  try {
    const { notificationId, stationId } = req.body;

    if (!notificationId || !stationId) {
      return res.status(400).json({ error: "notificationId and stationId required" });
    }

    const record = await NotificationStatus.findOne({ notificationId, stationId });
    if (!record) {
      return res.status(404).json({ error: "Notification not found" });
    }

    record.status = "delivered";
    record.deliveredAt = new Date();
    await record.save();

    res.status(200).json({ message: "Notification confirmed" });
  } catch (err) {
    console.error("Error confirming notification:", err);
    res.status(500).json({ error: "Failed to confirm notification" });
  }
});

router.post("/update-token", async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ error: "userId and fcmToken required" });
  }

  try {
    await Police.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: "FCM token updated." });
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ error: "Failed to update FCM token" });
  }
});


module.exports = router;
