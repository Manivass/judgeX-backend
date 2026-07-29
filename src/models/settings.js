const { Mongoose, default: mongoose, Schema } = require("mongoose");

const settingSchema = new mongoose.Schema({
  problemOfDay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

const Setting = new mongoose.model("Setting", settingSchema);
module.exports = Setting;
