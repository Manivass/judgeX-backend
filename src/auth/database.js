const mongoose = require("mongoose");
require("dotenv").config();
async function connectionDB() {
  await mongoose.connect(process.env.CONNECTION_STRING);
}

module.exports = connectionDB;