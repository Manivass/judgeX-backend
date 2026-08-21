const express = require("express");
const userAuth = require("../middleware/userAuth");
const User = require("../models/user");
const Question = require("../models/questions");
const Submission = require("../models/submission");
const submission = require("./submission");

const dashboard = express.Router();

dashboard.get("/admin/dashboard/stats", userAuth, async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const easyQuestions = await Question.countDocuments({ difficulty: "easy" });
    const mediumQuestions = await Question.countDocuments({
      difficulty: "medium",
    });
    const hardQuestions = await Question.countDocuments({ difficulty: "hard" });
    const totalQuestions = easyQuestions + mediumQuestions + hardQuestions;
    const submissions = await Submission.countDocuments();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUser,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        totalQuestions,
        submissions,
        newUsers,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

dashboard.get("/admin/getRecentProblems", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role != "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }
    const getQuestions = await Question.find().sort({ createdAt: 1 }).limit(5);
    res.status(200).json({
      success: true,
      message: "successfully fetched",
      question: getQuestions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
dashboard.get("/admin/getSubmissions", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;

    if (loggedUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access this page",
      });
    }

    const getSubmissions = await Submission.find()
      .populate("problemId", "title")
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Successfully fetched",
      submissions: getSubmissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = dashboard;
