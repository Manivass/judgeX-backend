const express = require("express");
const connectionDB = require("./auth/database.js");
require("dotenv").config();
const app = express();

connectionDB()
  .then(() => {
    console.log("database is successfully connected to server");
    app.listen(7777, () => {
      console.log("app is successfully connected");
    });
  })
  .catch(console.error);