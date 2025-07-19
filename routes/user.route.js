const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/user.controller")
const authMiddleware = require("../auth/authmiddleware");
router.post('/register', usercontroller.Police_Register);
router.post('/login', usercontroller.Police_Login);
router.post('/update-location', authMiddleware, usercontroller.Update_Location);
module.exports = router;