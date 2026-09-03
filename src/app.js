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
const editorial = require("./routes/editorial.js");
const payment = require("./routes/payment.js");
const request = require("./routes/request.js");
const http = require("http");
const initializeSocket = require("./utils/socket.js");
const chat = require("./routes/chat.js");

require("dotenv").config();
require("./utils/cron.js");
const app = express();

const server = http.createServer(app);
initializeSocket(server);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  "/payment/webhook",
  express.raw({
    type: "application/json",
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
app.use("/", editorial);
app.use("/", payment);
app.use("/", request);
app.use("/", chat);

connectionDB()
  .then(() => {
    console.log("database is successfully connected to server");
    server.listen(7777, () => {
      console.log("app is successfully connected");
    });
  })
  .catch(console.error);
