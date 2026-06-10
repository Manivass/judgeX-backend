const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log;
    if (!token) {
      return res.status(400).json({ success: false, message: "please login" });
    }
    const { _id } = await jwt.verify(token, process.env.JWTKEY);
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ success: false, message: "invalid token" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = userAuth;
