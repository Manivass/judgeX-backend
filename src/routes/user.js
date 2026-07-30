const express = require("express");
const User = require("../models/user");
const { validateSignUp, validateProfile } = require("../validation");
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");
const user = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { indianStates, indianLoactions } = require("../constant");
const Submission = require("../models/submission");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

user.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const isEmailAvailable = await User.findOne({ email });
    if (!isEmailAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      isEmailAvailable.password,
    );

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }

    const token = await isEmailAvailable.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 100 * 60 * 60 * 24),
    });
    res.status(200).json({
      success: true,
      message: "successfully logged in",
      user: isEmailAvailable,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

user.post("/signup", async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;
    await validateSignUp({ firstName, lastName, email, password });
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "email already exists" });
    }
    password = await bcrypt.hash(password, 10);

    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    const token = await newUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 100 * 60 * 60 * 24),
    });

    res.status(201).json({
      success: true,
      message: "successfully signed up",
      user: newUser,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

user.post("/google-login", async (req, res) => {
  try {
    const { token, authProvider } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const user = ticket.getPayload();

    const email = user.email;
    const firstName = user.given_name;
    const lastName = user.family_name;

    let isUserAvailable = await User.findOne({ email });
    if (!isUserAvailable) {
      isUserAvailable = new User({
        firstName,
        lastName,
        email,
        authProvider,
      });
      await isUserAvailable.save();
    }
    const jwtToken = await isUserAvailable.getJWT();

    res.cookie("token", jwtToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24),
    });

    res.status(200).json({ success: true, user: isUserAvailable });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    res.status(200).json({ success: true, updatedUser: loggedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

user.get("/getuser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isUserAvailable = await User.findById(id);
    if (!isUserAvailable)
      return res
        .status(404)
        .json({ success: "false", messagae: "no user found" });

    res.status(200).json({
      success: true,
      message: "user successfullt fetched",
      user: isUserAvailable,
    });
  } catch (err) {
    res.status(400).json({ success: false, messagae: err.messagae });
  }
});

user.get("/leaderboard", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;

    const sortUser = await User.find({})
      .sort({
        "solvedProblems.total": -1,
        createdAt: 1,
      })
      .select(
        "firstName lastName profilePicture solvedProblems.total solvedProblems.easy solvedProblems.medium solvedProblems.hard",
      );

    if (sortUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no users found" });
    }

    res.status(200).json({ success: true, leaderboard: sortUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

user.post("/state-location-search", userAuth, async (req, res) => {
  try {
    let search = req.body?.value?.trim()?.toLowerCase();
    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }
    const validState = indianLoactions.filter((state) =>
      state.toLowerCase().includes(search),
    );
    res
      .status(200)
      .json({ success: true, searchResult: validState.slice(0, 5) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

user.get("/heatmap", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const allsubmission = await Submission.find({ userId: loggedUser._id });
    const heatmap = {};
    for (let submission of allsubmission) {
      const date = submission.createdAt.toISOString().split("T")[0];
      if (!heatmap[date]) {
        heatmap[date] = 1;
      } else {
        heatmap[date]++;
      }
    }
    res.status(200).json({ success: true, heatmap });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
  }
});

module.exports = user;
