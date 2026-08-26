const mongoose = require("mongoose");

const editorialSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      unique: true,
    },

    bruteForce: {
      approach: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      timeComplexity: {
        type: String,
        required: true,
      },
      spaceComplexity: {
        type: String,
        required: true,
      },
    },

    optimization: {
      approach: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      timeComplexity: {
        type: String,
        required: true,
      },
      spaceComplexity: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Editorial = mongoose.model("Editorial", editorialSchema);

module.exports = Editorial;
