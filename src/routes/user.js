const express = require("express");
const User = require("../models/user");
const { validateSignUp } = require("../validation");
const bcrypt = require("bcrypt");
const user = express.Router();

user.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isEmailAvailable = await User.findOne({ email });

    if (!isEmailAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }

    const isPasswordCorrect =
      await isEmailAvailable.comparePasswordAndHash(password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }

    const token = await isEmailAvailable.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 100 * 60 * 60 * 24),
    });

    res.status(200).json({ success: true, message: "successfully logged in" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

user.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    await validateSignUp({ firstName, lastName, email, password });

    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    const token = await newUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 100 * 60 * 60 * 24),
    });

    res.status(201).json({ success: true, messagae: "successfully signed up" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = user;
