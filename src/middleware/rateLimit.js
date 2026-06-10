const rateLimit = require("express-rate-limit");

runCodeLimit = rateLimit({
  windowMs: 1000 * 10,
  max: 1,
  message: {
    success: false,
    message: "Please wait 10 seconds before running again",
  },
});

module.exports = runCodeLimit;
