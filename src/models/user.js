const mongoose = require("mongoose");
const validate = require("validator");
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
      maxLength: 8,
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
      validate: function (value) {
        if (!validate.isEmail(value)) {
          throw new Error("email id is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: false,
      validate: function (value) {
        if (!validate.isStrongPassword(value)) {
          throw new Error("Password is not strong");
        }
      },
    },
  },
  {
    timestamps: true,
  },
);
userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePasswordAndHash = async function (password) {
  const isPasswordValid = await bcrypt.compare(password, this.password);
  return isPasswordValid;
};

userSchema.methods.getJWT = async function () {
  const token =  jwt.sign({ email: this.email }, process.env.JWTKEY, {
    expiresIn: "1d",
  });

  return token;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
