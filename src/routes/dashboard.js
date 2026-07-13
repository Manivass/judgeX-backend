const express = require("express");
const userAuth = require("../middleware/userAuth");
const User = require("../models/user");
const Question = require("../models/questions");
const Submission = require("../models/submission");

const dashboard = express.Router();

dashboard.get("/dashboard/stats", userAuth, async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const easyQuestions = await Question.countDocuments({ difficulty: "easy" });
    const mediumQuestions = await Question.countDocuments({
      difficulty: "medium",
    });
    const hardQuestions = await Question.countDocuments({ difficulty: "hard" });
    const totalQuestions = easyQuestions + mediumQuestions + hardQuestions;
    const submissions = await Submission.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUser,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        totalQuestions,
        submissions,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = dashboard;
