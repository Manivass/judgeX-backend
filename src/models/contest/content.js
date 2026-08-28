const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number, // minutes
      required: true,
    },

    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    maxParticipants: {
      type: Number,
      default: 100,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Contest", contestSchema);
