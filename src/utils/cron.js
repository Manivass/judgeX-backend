const cron = require("node-cron");
const Question = require("../models/questions");
const Setting = require("../models/settings");

cron.schedule(
  "0 0 * * *",
  async () => {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    await Setting.findOneAndUpdate(
      {},
      { problemOfDay: question._id, updateAt: new Date() },
      {
        upsert: true,
      },
    );
  },
  {
    timezone: "Asia/Kolkata",
  },
);
