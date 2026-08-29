const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["accepted", "rejected",  "interested"],
        message: `{VALUE} is not valid status`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ConnectionRequest = new mongoose.model(
  "connectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequest;
