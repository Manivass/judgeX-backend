const express = require("express");
const connectionDB = require("./auth/database.js");
const user = require("./routes/user.js");
const cookieParser = require("cookie-parser");

require("dotenv").config();
const app = express();

app.use("/", express.json());
app.use("/", cookieParser());
app.use("/", user);

connectionDB()
  .then(() => {
    console.log("database is successfully connected to server");
    app.listen(7777, () => {
      console.log("app is successfully connected");
    });
  })
  .catch(console.error);
