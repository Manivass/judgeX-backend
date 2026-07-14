const mongoose = require("mongoose");
const { dataStructreTypes } = require("../constant");

const questionRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: `{VALUE} is not valid`,
      },
      required: true,
    },
    testcase: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        ishidden: {
          type: Boolean,
          required: true,
          enum: {
            values: [true, false],
            message: `{VALUE} is not valid`,
          },
          default: false,
        },
      },
    ],
    timeLimit: {
      type: Number,
      required: true,
    },
    memoryLimit: {
      type: Number,
      required: true,
    },
    constraints: {
      type: [String],
      required: true,
      lowercase: true,
    },
    dataStructure: {
      type: [String],
      required: true,
      lowercase: true,
    },
    explanation: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: `{VALUE} is not valid status`,
      },
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewReason: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);
let Question = new mongoose.model("QuestionRequest", questionRequestSchema);
module.exports = Question;
