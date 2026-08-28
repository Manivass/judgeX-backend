const express = require("express");
const Contest = require("../models/contest/contest");
const userAuth = require("../middleware/userAuth");
const ContestParticipant = require("../models/contest/participant");

const contest = express.Router();

contest.post("/contest/create", userAuth, async (req, res) => {
  try {
    if (req.user.role != "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can access the page" });
    }
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      problems,
      maxParticipants,
      isPublic,
    } = req.body;

    // 1. Required fields validation
    if (
      !title ||
      !description ||
      !startTime ||
      !endTime ||
      !duration ||
      !problems ||
      problems.length === 0
    ) {
      return res.status(400).json({
        message: "All required fields are missing",
      });
    }

    // 2. Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid startTime or endTime",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    // 3. Validate duration
    if (duration <= 0) {
      return res.status(400).json({
        message: "Duration must be greater than 0",
      });
    }

    // 4. Check whether questions exist
    const questionCount = await Question.countDocuments({
      _id: { $in: problems },
    });

    if (questionCount !== problems.length) {
      return res.status(400).json({
        message: "One or more questions are invalid",
      });
    }

    // 5. Create contest
    const contest = await Contest.create({
      title,
      description,
      startTime: start,
      endTime: end,
      duration,
      problems,
      createdBy: req.user._id,
      maxParticipants: maxParticipants || 100,
      isPublic: isPublic ?? true,
      status: "upcoming",
    });

    return res.status(201).json({
      message: "Contest created successfully",
      contest,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

contest.get("/contest/getcontests", userAuth, async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate("createdBy", "firstName lastName")
      .populate("problems", "title difficulty")
      .sort({ startTime: 1 });

    return res.status(200).json({
      message: "Contests fetched successfully",
      contests,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
contest.get("/contest/:contestId", userAuth, async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate("createdBy", "firstName lastName")
      .populate("problems", "title difficulty");

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found",
      });
    }

    return res.status(200).json({
      message: "Contest fetched successfully",
      contest,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

contest.post("/contest/:contestId/register", userAuth, async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    // 1. Check contest exists
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found",
      });
    }

    // 2. Check contest is upcoming
    if (contest.status !== "upcoming") {
      return res.status(400).json({
        message: "Registration is closed",
      });
    }

    // 3. Check maximum participants
    const participantCount = await ContestParticipant.countDocuments({
      contestId,
    });

    if (participantCount >= contest.maxParticipants) {
      return res.status(400).json({
        message: "Contest is full",
      });
    }

    // 4. Check already registered
    const existingParticipant = await ContestParticipant.findOne({
      contestId,
      userId,
    });

    if (existingParticipant) {
      return res.status(400).json({
        message: "You are already registered for this contest",
      });
    }

    // 5. Register user
    const participant = await ContestParticipant.create({
      contestId,
      userId,
    });

    return res.status(201).json({
      message: "Contest registered successfully",
      participant,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

contest.post("/contest/:contestId/submit", userAuth, async (req, res) => {
  try {
    const { contestId } = req.params;
    const { questionId, code, language } = req.body;

    const userId = req.user._id;

    // 1. Validate request
    if (!questionId || !code || !language) {
      return res.status(400).json({
        message: "Question, code and language are required",
      });
    }

    // 2. Check contest exists
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found",
      });
    }

    // 3. Check contest is live
    const now = new Date();

    if (now < contest.startTime) {
      return res.status(400).json({
        message: "Contest has not started yet",
      });
    }

    if (now > contest.endTime) {
      return res.status(400).json({
        message: "Contest has ended",
      });
    }

    // 4. Check user registered
    const participant = await ContestParticipant.findOne({
      contestId,
      userId,
    });

    if (!participant) {
      return res.status(403).json({
        message: "You are not registered for this contest",
      });
    }

    // 5. Check question belongs to contest
    const isQuestionInContest = contest.problems.some(
      (problem) => problem.toString() === questionId,
    );

    if (!isQuestionInContest) {
      return res.status(400).json({
        message: "This question does not belong to the contest",
      });
    }

    // 6. Create submission
    const submission = await ContestSubmission.create({
      contestId,
      userId,
      questionId,
      code,
      language,
      status: "pending",
      score: 0,
    });

    return res.status(201).json({
      message: "Code submitted successfully",
      submission,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

contest.post("/contest/:contestId/submissions", userAuth, async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const submissions = await ContestSubmission.find({
      contestId,
      userId,
    })
      .populate("questionId", "title difficulty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Contest submissions fetched successfully",
      submissions,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

contest.get("/contest/:contestId/leaderboard", userAuth, async (req, res) => {
  try {
    const { contestId } = req.params;

    // 1. Check contest exists
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found",
      });
    }

    // 2. Get participants
    const leaderboard = await ContestParticipant.find({
      contestId,
    })
      .populate("userId", "firstName lastName")
      .sort({
        score: -1,
        solvedCount: -1,
        penalty: 1,
      });

    // 3. Assign rank
    const rankedLeaderboard = leaderboard.map((participant, index) => ({
      rank: index + 1,
      user: participant.userId,
      score: participant.score,
      solvedCount: participant.solvedCount,
      penalty: participant.penalty,
    }));

    return res.status(200).json({
      message: "Leaderboard fetched successfully",
      leaderboard: rankedLeaderboard,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = contest;
