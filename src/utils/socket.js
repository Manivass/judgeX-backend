const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/contest/chat");

const getSecretRoom = (fromUserId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([fromUserId, toUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // JOIN CHAT
    socket.on("joinChat", ({ userName, fromUserId, toUserId }) => {
      const roomId = getSecretRoom(fromUserId, toUserId);

      console.log("Joining room:", roomId);

      socket.join(roomId);
    });

    // SEND MESSAGE
    socket.on(
      "sendMessage",
      async ({ userName, fromUserId, toUserId, text }) => {
        try {
          const roomId = getSecretRoom(fromUserId, toUserId);

          let chat = await Chat.findOne({
            participants: {
              $all: [fromUserId, toUserId],
            },
          });

          if (!chat) {
            chat = new Chat({
              participants: [fromUserId, toUserId],
              messages: [],
            });
          }

          // Add message
          chat.messages.push({
            senderId: fromUserId,
            userName,
            text,
          });
          console.log(chat.messages);

          // Save
          await chat.save();
          console.log("🔥 fromUserId:", fromUserId);
          console.log("🔥 toUserId:", toUserId);
          io.to(roomId).emit("MessageReceived", {
            senderId: fromUserId,
            userName,
            text,
          });
        } catch (err) {
          console.error(err);
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
