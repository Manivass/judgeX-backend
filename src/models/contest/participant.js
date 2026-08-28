const mongoose = require("mongoose");

const contestParticipantSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    score: {
      type: Number,
      default: 0,
    },

    solvedCount: {
      type: Number,
      default: 0,
    },

    penalty: {
      type: Number,
      default: 0,
    },

    rank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });

const ContestParticipant = new mongoose.Model(
  "ContestParticipant",
  contestParticipantSchema,
);

module.exports = ContestParticipant;
