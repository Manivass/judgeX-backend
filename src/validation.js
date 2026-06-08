const validate = require("validator");
const User = require("./models/user");
const { dataStructreTypes } = require("./constant");

const validateSignUp = async ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("pls fill all the credentails");
  }

  if (firstName.length < 3 || firstName.length > 18) {
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

const validateQuestion = (
  title,
  description,
  difficulty,
  examples,
  inputTestCases,
  outputTestCases,
  timeLimit,
  memoryLimit,
  constraintsText,
  dataStructure,
  explanation,
) => {
  if (
    !title ||
    !description ||
    !difficulty ||
    !examples ||
    !inputTestCases ||
    !outputTestCases ||
    !timeLimit ||
    !memoryLimit ||
    !constraintsText ||
    !dataStructure
  ) {
    throw new Error("pls fill all the credentials");
  }

  if (title.length > 40) {
    throw new Error("upto 40 characters are allowed for title");
  }

  if (description.length > 500) {
    throw new Error("only 500 characters are allowed for description");
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new Error(
      "difficulty status is not valid . only easy , medium and hard allowed",
    );
  }

  if (examples.input.length !== examples.output.length) {
    throw new Error("give proper example with  input and output");
  }

  if (inputTestCases.length !== outputTestCases.length) {
    throw new Error("give proper testcases with  input and output");
  }

  if (constraintsText.length > 10) {
    throw new Error("only 10 constraints are allowed");
  }

  if (!dataStructreTypes.includes(dataStructure)) {
    throw new Error("data structure type is not valid");
  }
};
const editValidateQuestion = ({
  title,
  description,
  difficulty,
  examples,
  inputTestCases,
  outputTestCases,
  timeLimit,
  memoryLimit,
  constraintsText,
  dataStructure,
  explanation,
}) => {
  if (title && title.length > 40) {
    throw new Error("upto 40 characters are allowed for title");
  }

  if (description && description.length > 500) {
    throw new Error("only 500 characters are allowed for description");
  }

  if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
    throw new Error(
      "difficulty status is not valid . only easy , medium and hard allowed",
    );
  }

  if (
    examples &&
    examples.input &&
    examples.output &&
    examples.input.length !== examples.output.length
  ) {
    throw new Error("give proper example with  input and output");
  }

  if (
    inputTestCases &&
    outputTestCases &&
    inputTestCases.length !== outputTestCases.length
  ) {
    throw new Error("give proper testcases with  input and output");
  }

  if (constraintsText && constraintsText.length > 10) {
    throw new Error("only 10 constraints are allowed");
  }

  if (dataStructure && !dataStructreTypes.includes(dataStructure)) {
    throw new Error("data structure type is not valid");
  }
};

const validateSubmissionCode = async (
  sourceCode,
  language,
  verdict,
  executionTime,
  memory,
) => {
  if (
    !sourceCode ||
    !language ||
    !verdict ||
    executionTime == null ||
    memory == null
  ) {
    throw new Error("pls fill all the credentials");
  }

  if (!["javascript", "c++", "java", "python"].includes(language)) {
    throw new Error("pls select a valid language");
  }

  if (
    ![
      "Accepted",
      "Wrong Answer",
      "Runtime Error",
      "Compilation Error",
      "Time Limit Exceeded",
    ].includes(verdict)
  ) {
    throw new Error("pls enter a valid verdict");
  }

  if (sourceCode.length > 10000) {
    throw new Error("code is too large");
  }
};

module.exports = {
  validateSignUp,
  validateQuestion,
  editValidateQuestion,
  validateSubmissionCode,
};
