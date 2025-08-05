const express = require("express");
const router = express.Router();
const womencontroller = require("../controllers/women.controller");
const auth = require("../auth/authmiddleware"); // 🛡️ import auth middleware

// 🔐 Secure routes
router.post('/womendata', womencontroller.womendatapost);
router.get('/getwomennear', auth, womencontroller.getWomenNearByPoliceStation);


module.exports = router;
