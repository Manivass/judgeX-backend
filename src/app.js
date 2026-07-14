const express = require("express");
const connectionDB = require("./auth/database.js");
const user = require("./routes/user.js");
const cookieParser = require("cookie-parser");
const code = require("./routes/code.js");
const questions = require("./routes/questions.js");
const cors = require("cors");
const dashboard = require("./routes/dashboard.js");
const submission = require("./routes/submission.js");
const questionRequest = require("./routes/questionRequest.js");

require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/", express.json());
app.use("/", cookieParser());
app.use("/", user);
app.use("/", code);
app.use("/", questions);
app.use("/", dashboard);
app.use("/", submission);
app.use("/", questionRequest);

connectionDB()
  .then(() => {
    console.log("database is successfully connected to server");
    app.listen(7777, () => {
      console.log("app is successfully connected");
    });
  })
  .catch(console.error);
