const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 18,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 8,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: function (value) {
        if (!validator.isEmail(value)) {
          throw new Error("email id is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: false,
      validate: function (value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong");
        }
      },
      select: false,
    },
    profilePicture: {
      type: String,
      required: true,
      default: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
      validate: function (value) {
        if (!validator.isURL(value)) {
          throw new Error("profile picture URL is not valid");
        }
      },
    },
    bio: {
      type: String,
      validate: function (value) {
        if (value && value.length > 300) {
          throw new Error("bio must have less than 300 characters");
        }
      },
    },
    college: {
      type: String,
    },
    githubURL: {
      type: String,
      validate: function (value) {
        if (!validator.isURL(value)) {
          throw new Error("github URL is not valid");
        }
      },
    },
    linkedinURL: {
      type: String,
      validate: function (value) {
        if (!validator.isURL(value)) {
          throw new Error("linkedin URL is not valid");
        }
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: `{VALUE} is not a valid role`,
      },
      trim: true,
      required: true,
      default: "user",
    },
    solvedProblems: {
      easy: {
        type: Number,
        required: true,
        default: 0,
      },
      medium: {
        type: Number,
        required: true,
        default: 0,
      },
      hard: {
        type: Number,
        required: true,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    attemptedProblems: {
      easy: {
        type: Number,
        required: true,
        default: 0,
      },
      medium: {
        type: Number,
        required: true,
        default: 0,
      },
      hard: {
        type: Number,
        required: true,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    totalSubmissions: {
      easy: {
        type: Number,
        required: true,
        default: 0,
      },
      medium: {
        type: Number,
        required: true,
        default: 0,
      },
      hard: {
        type: Number,
        required: true,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    acceptedSubmissions: {
      easy: {
        type: Number,
        required: true,
        default: 0,
      },
      medium: {
        type: Number,
        required: true,
        default: 0,
      },
      hard: {
        type: Number,
        required: true,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePasswordAndHash = async function (password) {
  const isPasswordValid = await bcrypt.compare(password, this.password);
  return isPasswordValid;
};

userSchema.methods.getJWT = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTKEY, {
    expiresIn: "1d",
  });

  return token;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
