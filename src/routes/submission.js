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

submission.get("/recentSubmissions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 10) limit = 10;

    const skip = (page - 1) * limit;

    const totalSubmissions = await Submission.countDocuments({
      userId: id,
    });

    const totalPages = Math.ceil(totalSubmissions / limit);

    const submissions = await Submission.find({
      userId: id,
    })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      submissions,
      pagination: {
        currentPage: page,
        limit,
        totalSubmissions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
});

submission.get("/submissionDetails/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const getSubmission = await Submission.findById(id).populate(
      "problemId",
      "title",
    );

    if (!getSubmission)
      return res
        .status(404)
        .json({ success: false, message: "no submission found" });

    return res.status(200).json({
      success: true,
      message: "succesfully fetched",
      submission: getSubmission,
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
