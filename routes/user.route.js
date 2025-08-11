const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/user.controller");
const authMiddleware = require("../auth/authmiddleware");
const Police = require("../models/user.model"); // ✅ Add this line
const NotificationStatus=require("../models/NotificationStatusSchema")
router.post('/register', usercontroller.Police_Register);
router.post('/login', usercontroller.Police_Login);
router.patch("/police/update-profile", authMiddleware, usercontroller.Police_UpdateProfile);
router.get('/alluser', usercontroller.All_login);
router.post('/update-location', authMiddleware, usercontroller.Update_Location);
router.post("/confirm-notification", async (req, res) => {
  try {
    const { notificationId, phoneNumber } = req.body;

    if (!notificationId || !phoneNumber) {
      return res.status(400).json({ error: "notificationId and phoneNumber are required" });
    }

    const record = await NotificationStatus.findOne({ notificationId });

    if (!record) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // ✅ If already delivered, block others
    if (record.status === "delivered") {
      return res.status(403).json({
        error: "Notification already confirmed by another officer",
        deliveredBy: record.deliveredBy,
        deliveredAt: record.deliveredAt
      });
    }

    // ✅ Update the notification
    record.status = "delivered";
    record.deliveredAt = new Date();
    record.deliveredBy = phoneNumber;
    await record.save();

    res.status(200).json({ message: "Notification confirmed successfully" });

  } catch (err) {
    console.error("Error confirming notification:", err);
    res.status(500).json({ error: "Failed to confirm notification" });
  }
});





module.exports = router;
