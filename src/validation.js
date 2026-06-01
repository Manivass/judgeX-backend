const validate = require("validator");
const User = require("./models/user");


const validateSignUp = async ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("pls fill all the credentails");
  }

  if (firstName.length < 3 || firstName.length > 8) {
    throw new Error("firstname must be in 3 to 8 characters");
  }

  if (lastName && lastName.length > 8) {
    throw new Error("lastname must up to 8 characters");
  }

  let isEmailFound = await User.findOne({ email });
  if (isEmailFound) {
    throw new Error("email already exists..");
  }

  if (!validate.isEmail(email)) {
    throw new Error("email is not valid");
  }

  if (!validate.isStrongPassword(password)) {
    throw new Error("password is not strong");
  }
};

module.exports = { validateSignUp };
