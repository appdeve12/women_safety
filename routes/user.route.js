const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/user.controller")
const authMiddleware = require("../auth/authmiddleware");
router.post('/register', usercontroller.Police_Register);
router.post('/login', usercontroller.Police_Login);
router.post('/update-location', authMiddleware, usercontroller.Update_Location);
router.post("/update-token", async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ error: "userId and fcmToken required" });
  }

  try {
    await Police.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: "FCM token updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update FCM token" });
  }
});
module.exports = router;