const express = require("express");
const userAuth = require("../middleware/userAuth");
const Question = require("../models/questions");
const Submission = require("../models/submission");

const submission = express.Router();

submission.get("/getSubmission/:questionId", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const questionId = req.params.questionId;
    const getQuestion = await Question.findById(questionId);
    if (!getQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "no question found" });
    }
    const submissions = await Submission.find({
      userId: _id,
      problemId: questionId,
    });

    res.status(200).json({
      success: true,
      message: "successfully get submission",
      submissions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = submission;
