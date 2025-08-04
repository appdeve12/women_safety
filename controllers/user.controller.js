// Register Police
const bcrypt = require("bcryptjs");
const Police = require("../models/user.model");
const jwt = require("jsonwebtoken")



exports.Police_Register = async (req, res) => {
  try {
    const {
      state,
      district,
      stationName,
      phoneNumber,
      password,
      location,

      secondaryNumbers // expected array of { number, position }
    } = req.body;

    if (!state || !district || !stationName || !phoneNumber || !password) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    if (!Array.isArray(secondaryNumbers)) {
      return res.status(400).json({ error: "secondaryNumbers must be an array of objects" });
    }

    // Optional: Validate each secondaryNumber object
    for (let entry of secondaryNumbers) {
      if (!entry.number || !entry.position) {
        return res.status(400).json({ error: "Each secondary number must have a number and position" });
      }
    }

    const existing = await Police.findOne({ phoneNumber });
    if (existing) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPolice = new Police({
      state,
      district,
      stationName,
      phoneNumber,
      password: hashedPassword,
      location,

      secondaryNumbers
    });

    await newPolice.save();

    res.status(200).json({
      status: 200,
      message: "Police registered successfully",
      data: newPolice
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.Police_Login = async (req, res) => {
  try {
    const { phoneNumber, password, fcmToken } = req.body;

    let police = await Police.findOne({ phoneNumber });
    let isSecondary = false;

    if (!police) {
      police = await Police.findOne({ "secondaryNumbers.number": phoneNumber });
      isSecondary = true;
    }

    if (!police) {
      return res.status(401).json({ error: "Police not found" });
    }

    const isMatch = await bcrypt.compare(password, police.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ FCM token update logic
    if (fcmToken) {
      if (isSecondary) {
        const index = police.secondaryNumbers.findIndex(sec => sec.number === phoneNumber);
        if (index !== -1) {
          police.secondaryNumbers[index].fcmToken = fcmToken;
        }
      } else {
        police.fcmToken = fcmToken;
      }
      await police.save();
    }

    const token = jwt.sign(
      { id: police._id, stationName: police.stationName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: 200,
      message: "Login successful",
      token,
      police
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
// Update Police Profile
exports.Police_UpdateProfile = async (req, res) => {
  try {
    const policeId = req.user.id; // assuming authentication middleware sets `req.user`
    const {
   
      secondaryNumbers, // optional array of { number, position }
    } = req.body;

    const police = await Police.findById(policeId);

    if (!police) {
      return res.status(404).json({ error: "Police not found" });
    }

   

    if (secondaryNumbers) {
      if (!Array.isArray(secondaryNumbers)) {
        return res.status(400).json({ error: "secondaryNumbers must be an array" });
      }

      for (let entry of secondaryNumbers) {
        if (!entry.number || !entry.position) {
          return res.status(400).json({ error: "Each secondary number must have a number and position" });
        }
      }

      // Overwrite or add to the existing list
      police.secondaryNumbers = secondaryNumbers;
    }

    await police.save();

    res.json({
      status: 200,
      message: "Profile updated successfully",
      data: police,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
};


exports.All_login=async(req,res)=>{
  try{
    const fetchalllogin= await Police.find();
    res.status(200).json({
      message:"all data fetch successfully",fetchalllogin
    })
  }
  catch(error){
    
  }
}
// Auto Update Police Location
exports.Update_Location = async (req, res) => {
  try {
    const policeId = req.user.id; // Comes from decoded JWT
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const updated = await Police.findByIdAndUpdate(
      policeId,
      { location: { latitude, longitude } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Police not found" });
    }

    res.json({ status: 200, message: "Location updated", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Location update failed" });
  }
};
