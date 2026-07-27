const express = require("express");
const userAuth = require("../middleware/userAuth");
const Question = require("../models/questions");
const Submission = require("../models/submission");
const mongoose = require("mongoose");
const User = require("../models/user");

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
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "successfully get submission",
      submissions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

submission.get("/getSolutions/:questionId", async (req, res) => {
  try {
    let questionId = req.params.questionId;
    const isQuestionAvailable = await Question.findById(questionId);
    if (!isQuestionAvailable) {
      return res
        .status(404)
        .json({ success: false, message: "question not found" });
    }
    const solutions = await Submission.aggregate([
      {
        $match: {
          problemId: new mongoose.Types.ObjectId(questionId),
          verdict: "Right Answer",
        },
      },
      { $sort: { executionTime: 1 } },
      {
        $group: {
          _id: "$userId",
          bestSolution: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users", // collection name
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          bestSolution: 1,
          "user.firstName": 1,
          "user.lastName": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "solutions fetched successfully",
      solutions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

submission.get("/totalSubmissions/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const { id } = req.params;
    const totalSubmissions = await Submission.countDocuments({
      userId: id,
    });

    const passedSubmissions = await Submission.countDocuments({
      userId: id,
      result: true,
    });

    res.status(200).json({
      success: true,
      submission: { totalSubmissions, passedSubmissions },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

submission.get("/submissionDetails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const getDetails = await Submission.findById(id).populate(
      "problemId",
      "title difficulty",
    );
    if (!getDetails) {
      return res
        .status(404)
        .json({ success: false, message: "no submission found" });
    }
    res.status(200).json({
      success: true,
      message: "successfully fetched ",
      submission: getDetails,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

submission.get("/recentSubmissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ userId: id })
      .populate("problemId", "title difficulty")
      .sort({
        createdAt: -1,
      });

    const seen = new Set();
    const recentProblems = [];
    for (let submission of submissions) {
      const questionId = submission.problemId.toString();
      if (!seen.has(questionId)) {
        seen.add(questionId);
        recentProblems.push(submission);
      }
    }
    res.status(200).json({
      success: true,
      message: "successfully fetched",
      submissions: recentProblems,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
  }
});

module.exports = submission;
