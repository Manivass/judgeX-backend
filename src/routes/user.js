const express = require("express");
const User = require("../models/user");
const { validateSignUp, validateProfile } = require("../validation");
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");
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
    let { firstName, lastName, email, password } = req.body;
    await validateSignUp({ firstName, lastName, email, password });
    password = await bcrypt.hash(password, 10);

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

user.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0) });
    res.status(200).json({ success: true, messagae: "logout successfully" });
  } catch (err) {
    res.status(500).json({ success: false, messagae: err.messagae });
  }
});

user.get("/profile", userAuth, async (req, res) => {
  try {
    const _id = req.user._id;
    const userAvailable = await User.findById(_id).select(
      "firstName lastName role profilePicture bio college linkedinURL solvedProblems attemptedProblems totalSubmissions acceptedSubmissions",
    );
    if (!userAvailable) {
      return res.status(404).json({ success: false, message: "no user found" });
    }

    res.status(200).json({ success: true, user: userAvailable });
  } catch (err) {
    res.status(400).json({ success: false, message: err.messagae });
  }
});

user.post("/editProfile", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    let edited = req.body;
    validateProfile(edited);
    Object.keys(edited).forEach((val) => (loggedUser[val] = edited[val]));
    await loggedUser.save();
    res.status(200).json({ success: true, messagae: loggedUser });
  } catch (err) {
    res.status(400).json({ success: false, messagae: err.message });
  }
});

user.get("/leaderboard", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }

    const sortUser = await User.find({})
      .sort({
        "solvedProblems.total": -1,
        createdAt: 1,
      })
      .select("firstName lastName profilePicture solvedProblems.total");

    if (sortUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no users found" });
    }

    res.status(200).json({ success: true, leaderboard: sortUser });
  } catch (err) {
    res.status(400).json({ success: false, messagae: err.messagae });
  }
});

module.exports = user;
