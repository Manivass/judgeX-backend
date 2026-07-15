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

questionRequest.post("/reviewquestion/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const { id } = req.params;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can review the page" });
    }
    const isRequestAvailable = await questionRequest.findById(id);
    if (!isRequestAvailable) {
      return res
        .status(404)
        .json({ success: false, message: "no request found" });
    }
    const { reviewComment, status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid status" });
    }
    if (isRequestAvailable.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }
    if (status === "rejected" && !reviewComment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required when rejecting a request",
      });
    }

    if (status === "accepted") {
      const exists = await Question.findOne({
        title: isRequestAvailable.title,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Question already exists",
        });
      }

      const totalQuestion = await Question.countDocuments();
      const newQuestion = new Question({
        title: isRequestAvailable.title,
        description: isRequestAvailable.description,
        difficulty: isRequestAvailable.difficulty,
        testcase: isRequestAvailable.testcase,
        timeLimit: isRequestAvailable.timeLimit,
        memoryLimit: isRequestAvailable.memoryLimit,
        constraints: isRequestAvailable.constraints,
        dataStructure: isRequestAvailable.dataStructure,
        explanation: isRequestAvailable.explanation,
        questionNumber: totalQuestion + 1,
      });
      await newQuestion.save();
    }

    isRequestAvailable.reviewedBy = loggedUser._id;
    isRequestAvailable.status = status;
    isRequestAvailable.reviewReason = reviewComment;
    await isRequestAvailable.save();
    return res.status(200).json({
      success: true,
      message: `Question ${status} successfully`,
      questionRequest: isRequestAvailable,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

questionRequest.get("/getRequests", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }
    const requests = await QuestionRequest.find({ status: "pending" })
      .populate("createdBy", "firstName lastName email profilePicture")
      .sort({ createdAt: -1 });
    const pendingRequests = await QuestionRequest.countDocuments({
      status: "pending",
    });
    const acceptedRequests = await QuestionRequest.countDocuments({
      status: "accepted",
    });
    const rejectedRequests = await QuestionRequest.countDocuments({
      status: "rejected",
    });

    res.status(200).json({
      success: true,
      message: "successfully fetched the details",
      requests,
      stats: {
        pending: pendingRequests,
        rejected: rejectedRequests,
        accepted: acceptedRequests,
        total: pendingRequests + rejectedRequests + acceptedRequests,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err?.message });
  }
});


questionRequest.get("/request/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;

    if (loggedUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access this page",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request id",
      });
    }

    const request = await QuestionRequest.findOne({
      _id: id,
      status: "pending",
    }).populate("createdBy", "firstName lastName email profilePicture");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Question request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question request fetched successfully",
      request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = questionRequest;
