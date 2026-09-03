const express = require("express");
const userAuth = require("../middleware/userAuth");
const Chat = require("../models/contest/chat");

const chat = express.Router();

chat.get("/chat/:toUserId", userAuth, async (req, res) => {
  try {
    const { toUserId } = req.params;
    const loggedUser = req.user;
    let chat = await Chat.findOne({
      participants: {
        $all: [toUserId, loggedUser._id],
      },
    }).populate("messages.senderId", " firstName lastName");
    if (!chat) {
      chat = new Chat({
        participants: [toUserId, loggedUser._id],
        messages: [],
      });
      await chat.save();
    }
    res.status(200).json({ chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = chat;
