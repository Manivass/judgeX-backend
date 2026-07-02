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
    disscuss: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "User",
        },
        likes: {
          type: Number,
          default: 0,
        },
        text: {
          type: String,
          validate: function (value) {
            if (value.length > 1000) {
              throw new Error("text must less than 1000 character");
            }
          },
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
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
