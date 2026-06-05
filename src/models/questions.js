const mongoose = require("mongoose");
const { dataStructreTypes } = require("../constant");

const questionsSchema = new mongoose.Schema(
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
    examples: {
      input: {
        type: [String],
        required: true,
      },
      output: {
        type: [String],
        required: true,
      },
    },
    inputTestCases: {
      type: [String],
      required: true,
    },
    outputTestCases: {
      type: [String],
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    memoryLimit: {
      type: Number,
      required: true,
    },
    constraintsText: {
      type: [String],
      required: true,
      lowercase: true,
    },
    dataStructure: {
      type: String,
      required: true,
      enum: {
        values: dataStructreTypes,
      },
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    explanation: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
let Question = new mongoose.model("Question", questionsSchema);
module.exports = Question;
