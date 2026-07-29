const express = require("express");
const Question = require("../models/questions");
const userAuth = require("../middleware/userAuth");
const { validateQuestion, editValidateQuestion } = require("../validation");
const { dataStructreTypes } = require("../constant");
const Setting = require("../models/settings");
const question = express.Router();

question.post("/addQuestions", userAuth, async (req, res) => {
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
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }
    const questionValid = validateQuestion(
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

    const newQuestion = new Question({
      title,
      description,
      difficulty,
      testcase,
      timeLimit,
      memoryLimit,
      constraints,
      dataStructure,
      createdBy: loggedUser._id,
      explanation,
    });

    await newQuestion.save();

    res
      .status(201)
      .json({ success: true, message: "question successfully  added" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

question.get("/questions", userAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const questions = await Question.find({})
      .sort({ questionNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalQuestions = await Question.countDocuments();
    const easyQuestion = await Question.countDocuments({ difficulty: "easy" });
    const mediumQuestion = await Question.countDocuments({
      difficulty: "medium",
    });
    const hardQuestion = await Question.countDocuments({ difficulty: "hard" });

    res.status(200).json({
      success: true,
      questions,
      currentPage: page,
      totalQuestions,
      questionCount: { easyQuestion, mediumQuestion, hardQuestion },
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
    const id = req.params.id;
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

question.get("/question/search", userAuth, async (req, res) => {
  try {
    const difficulty = req.query.difficulty || "all";
    const dataStructure = req.query.dataStructure || "all";

    if (!["all", "easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
      });
    }
    if (dataStructure != "all" && !dataStructreTypes.includes(dataStructure)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataStructure",
      });
    }

    const filter = {};

    if (difficulty !== "all") {
      filter.difficulty = difficulty;
    }
    if (dataStructure !== "all") {
      filter.dataStructure = dataStructure;
    }

    const getQuestions = await Question.find(filter);
    res.status(200).json({
      success: true,
      message: "successfully fetched",
      questions: getQuestions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
question.get("/question/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "no question found" });
    }

    res.status(200).json({ success: true, question });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
  }
});

question.post(
  "/question/discussion/:questionId",
  userAuth,
  async (req, res) => {
    try {
      const questionId = req.params.questionId;
      const isQuestionAvailable = await Question.findById(questionId);
      let { text } = req.body;
      if (!isQuestionAvailable) {
        return res
          .status(404)
          .json({ success: true, message: "no question found" });
      }

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: "Discussion cannot be empty",
        });
      }

      isQuestionAvailable.discussion.push({
        userId: req.user._id,
        text,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      });

      await isQuestionAvailable.save();
      res.status(201).json({
        success: true,
        message: "successfully disscussion created",
        question: isQuestionAvailable,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
);

question.get("/problemOfTheDay", async (req, res) => {
  try {
    const setting = await Setting.findOne().populate("problemOfDay");
    res.json({
      success: true,
      question: setting.problemOfDay,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = question;
