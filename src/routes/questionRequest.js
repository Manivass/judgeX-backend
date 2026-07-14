const express = require("express");
const userAuth = require("../middleware/userAuth");
const { validateQuestion } = require("../validation");
const Question = require("../models/questions");
const QuestionRequest = require("../models/questionRequest");
const questionRequest = express.Router();

questionRequest.post("/questionRequest", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const {
      title,
      description,
      difficulty,
      testcase,
      timeLimit,
      memoryLimit,
      constraints,
      dataStructure,
      explanation,
    } = req.body;
    if (loggedUser.role !== "user") {
      return res
        .status(403)
        .json({ success: false, message: "only user can request" });
    }
    validateQuestion(
      title,
      description,
      difficulty,
      testcase,
      timeLimit,
      memoryLimit,
      constraints,
      dataStructure,
      explanation,
    );
    const existingQuestion = await Question.find({
      title: title.trim(),
    });

    if (existingQuestion.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Question already found" });
    }

    const existingRequest = await QuestionRequest.find({
      title: title.trim(),
      createdBy: loggedUser._id,
    });

    if (existingRequest.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Question request already exists" });
    }

    const newQuestionRequest = new QuestionRequest({
      title,
      description,
      difficulty,
      testcase,
      timeLimit,
      memoryLimit,
      constraints,
      dataStructure,
      explanation,
      createdBy: loggedUser._id,
    });

    await newQuestionRequest.save();
    res
      .status(201)
      .json({ success: true, message: "question requested  added" });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
  }
});

module.exports = questionRequest;
