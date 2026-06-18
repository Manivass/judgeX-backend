const validator = require("validator");
const User = require("./models/user");
const { dataStructreTypes, indianLoactions } = require("./constant");

const validateSignUp = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  profilePicture,
  bio,
  college,
  linkedinURL,
  solvedProblems,
  attemptedProblems,
  totalSubmissions,
  acceptedSubmissions,
}) => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("pls fill all the credentails");
  }

  if (firstName.length < 3 || firstName.length > 18) {
    throw new Error("firstname must be in 3 to 8 characters");
  }

  if (lastName && lastName.length > 12) {
    throw new Error("lastname must up to 8 characters");
  }

  if (!validator.isEmail(email)) {
    throw new Error("email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("password is not strong");
  }
};

const validateProfile = ({
  firstName,
  lastName,
  profilePicture,
  bio,
  githubURL,
  linkedinURL,
  instagramURL,
  solvedProblems,
  attemptedProblems,
  totalSubmissions,
  acceptedSubmissions,
  college,
  contactEmail,
  state,
  phoneNumber,
}) => {
  if (!firstName && firstName.trim().length === 0) {
    throw new Error("pls fill first firstName");
  }

  if (firstName && (firstName.length > 18 || firstName.length < 3)) {
    throw new Error("first name must have 3 to 18 character");
  }

  if (lastName && lastName.trim().length > 8) {
    throw new Error("last name must have below 8 characters");
  }

  if (profilePicture && !validator.isURL(profilePicture)) {
    throw new Error("profile picture URL is not valid");
  }

  if (contactEmail && !validator.isEmail(contactEmail)) {
    throw new Error("contact email is not valid");
  }

  if (linkedinURL && !validator.isURL(linkedinURL)) {
    throw new Error("linkedin  URL is not valid");
  }
  if (instagramURL && !validator.isURL(instagramURL)) {
    throw new Error("instagram  URL is not valid");
  }

  if (phoneNumber && !validator.isMobilePhone(phoneNumber)) {
    throw new Error("phone number is not valid");
  }

  if (
    solvedProblems &&
    (solvedProblems.easy < 0 ||
      solvedProblems.medium < 0 ||
      solvedProblems.hard < 0)
  ) {
    throw new Error("solved problems must greater than or equal to zero");
  }

  if (
    attemptedProblems &&
    (attemptedProblems.easy < 0 ||
      attemptedProblems.medium < 0 ||
      attemptedProblems.hard < 0)
  ) {
    throw new Error("attempted problems must greater than or equal to zero");
  }
  if (
    totalSubmissions &&
    (totalSubmissions.easy < 0 ||
      totalSubmissions.medium < 0 ||
      totalSubmissions.hard < 0)
  ) {
    throw new Error("total submissions must greater than or equal to zero");
  }

  if (state && !indianLoactions.includes(state)) {
    throw new Error("state is not found");
  }

  if (
    acceptedSubmissions &&
    (acceptedSubmissions.easy < 0 ||
      acceptedSubmissions.medium < 0 ||
      acceptedSubmissions.hard < 0)
  ) {
    throw new Error("accepted submissions must greater than or equal to zero");
  }

  if (githubURL && !validator.isURL(githubURL)) {
    throw new Error("github URL  is not valid");
  }

  if (bio && bio.length > 300) {
    throw new Error("bio must have greater than 300 character");
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

const validateSubmissionCode = async ({
  sourceCode,
  language,
  verdict,
  executionTime,
  memory,
}) => {
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
  validateProfile,
};
