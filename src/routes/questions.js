const express = require("express");
const Question = require("../models/questions");
const userAuth = require("../middleware/userAuth");
const { validateQuestion } = require("../validation");
const question = express.Router();

question.post("/questions", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const {
      title,
      description,
      difficulty,
      examples,
      inputTestCases,
      outputTestCases,
      timeLimit,
      memoryLimit,
      constraintsText,
      dataStructure,
      explanation,
    } = req.body;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }
    const questionValid = validateQuestion(
      title,
      description,
      difficulty,
      examples,
      inputTestCases,
      outputTestCases,
      timeLimit,
      memoryLimit,
      constraintsText,
      dataStructure,
      explanation,
    );

    if (!questionValid) {
      return res.status(400);
    }

    const newQuestion = new Question({
      title,
      description,
      difficulty,
      examples,
      inputTestCases,
      outputTestCases,
      timeLimit,
      memoryLimit,
      constraintsText,
      dataStructure,
      createdBy: loggedUser._id,
      explanation,
    });

    await newQuestion.save();

    res
      .status(201)
      .json({ success: true, message: "successfully question added" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = question;
