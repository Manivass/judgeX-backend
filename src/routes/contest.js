const express = require("express");
const Contest = require("../models/contest/contest");

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
