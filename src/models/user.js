const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    },
  },
  {
    timestamps: true,
  },
);

const User = new mongoose.model("User", userSchema);

module.exports = User;
