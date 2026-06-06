const express = require("express");
const Question = require("../models/questions");
const userAuth = require("../middleware/userAuth");
const { validateQuestion, editValidateQuestion } = require("../validation");
const question = express.Router();

question.post("/addQuestions", userAuth, async (req, res) => {
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

question.get("/questions", userAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const questions = await Question.find({})
      .skip((page - 1) * limit)
      .limit(limit);
    const totalQuestions = Question.countDocuments();

    res.status(200).json({
      success: true,
      questions,
      currentPage: page,
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / limitf),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

question.post("/editQuestion/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role != "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only user can access the page" });
    }

    const title = req.params.id;
    const isQuestionAvailable = await Question.findOne({ _id: id });
    let editedData = req.body;

    if (!isQuestionAvailable) {
      return res
        .status(404)
        .json({ success: false, message: "question is not available" });
    }

    editValidateQuestion(editedData);

    Object.keys(editedData).forEach((key) => {
      if (key !== "createdBy") {
        isQuestionAvailable[key] = editedData[key];
      }
    });
    await isQuestionAvailable.save();

    res.status(200).json({ success: true, message: "successfully edited" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

question.delete("/deleteQuestion/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin delete the question" });
    }
    const _id = req.params.id;

    const questionDelete = await Question.findOneAndDelete({ _id });
    if (!questionDelete) {
      return res
        .status(404)
        .json({ success: false, message: "question not found" });
    }

    res.status(200).json({ success: true, message: "successfully deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = question;
