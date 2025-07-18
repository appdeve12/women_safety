// Register Police
const bcrypt = require("bcryptjs");
const Police = require("../models/user.model");
const jwt=require("jsonwebtoken")

exports.Police_Register = async (req, res) => {
    try {
        const {

            state,
            district,
            stationName,
            phoneNumber,
            password,
            location // optional
        } = req.body;

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
            location
        });

        await newPolice.save();

        res.status(200).json({ 
            status:200,
            message: "Police registered successfully" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
}
// Login Police
exports.Police_Login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const police = await Police.findOne({ phoneNumber });

    if (!police) {
      return res.status(401).json({ error: "Police not found" });
    }

    const isMatch = await bcrypt.compare(password, police.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
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
      police: {
        id: police._id,
        stationName: police.stationName,
        location: police.location
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
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
