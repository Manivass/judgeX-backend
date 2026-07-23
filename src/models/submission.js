const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    sourceCode: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
      enum: {
        values: ["Javascript", "C", "Java", "Python"],
        message: `{VALUE} is not valid language`,
      },
    },

    verdict: {
      type: String,
      enum: {
        values: [
          "Accepted",
          "Wrong Answer",
          "Runtime Error",
          "Compilation Error",
          "Time Limit Exceeded",
        ],
        message: `{VALUE} is not valid verdict`,
      },
      required: true,
    },

    executionTime: {
      type: Number,
      required: true,
    },

    memory: {
      type: Number,
      required: true,
    },

    testcaseResults: {
      type: [String],
    },
    result: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

const Submission = new mongoose.model("Submission", submissionSchema);

module.exports = Submission;
