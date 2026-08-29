const express = require("express");
const userAuth = require("../middleware/userAuth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const request = express.Router();

request.post("/request/send/:toUserId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const { toUserId } = req.params;
    const fromUserId = loggedUser._id;
    const isToUserAvailable = await User.findById(toUserId);
    if (!isToUserAvailable) {
      return res.status(404).json({ success: false, message: "no user found" });
    }

    const isConnectionAlreadySend = await ConnectionRequest.find({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (isConnectionAlreadySend.length == 0)
      return res
        .status(403)
        .json({ success: false, message: "request already send" });
    if (fromUserId.equals(toUserId)) {
      throw new Error("you cannot send message to yourself");
    }

    const newConnectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status: "interested",
    });
    await newConnectionRequest.save();
    res
      .status(200)
      .json({ success: true, message: "successfully request send" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

request.post("/request/review/:status/:reqId", userAuth, async (req, res) => {
  try {
    let loggedUser = req.user;
    let { status, reqId } = req.params;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send(status + " is not valid status");
    }
    const connectionAvailable = await ConnectionRequest.findOne({
      _id: reqId,
      toUserId: loggedUser._id,
      status: "interested",
    });
    if (!connectionAvailable) {
      return res.status(404).send("user not found");
    }
    connectionAvailable.status = status;
    await connectionAvailable.save();
    res
      .status(200)
      .json({ success: false, message: status + " successfully " });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = request;
