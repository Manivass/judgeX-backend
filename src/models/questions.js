const mongoose = require("mongoose");
const { dataStructreTypes } = require("../constant");

const questionsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
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
      lowercse: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    explanation: {
      type: String,
    },
    editorial: [
      {
        approach: String,
        algorithm: String,
        complexity: Object,
        code: {
          language: String,
          solution: [String],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);
let Question = new mongoose.model("Question", questionsSchema);
module.exports = Question;
