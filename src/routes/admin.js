const express = require("express");
const userAuth = require("../middleware/userAuth");

const admin = express.Router();

admin.post("/admin/questions-add", userAuth, async (req, res) => {
  try {
    const loggesUser = req.user;
    if (req.user != "admin") {
      return res.status(400).json({
        success: false,
        message: "this page is allowed only for admins",
      });
    }
    
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
