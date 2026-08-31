const socket = require("socket.io");
const crypto = require("crypto");

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
    socket.on("sendMessage", ({ userName, fromUserId, toUserId, text }) => {
      console.log(userName + " Message Received : " + text);

      const roomId = getSecretRoom(fromUserId, toUserId);

      io.to(roomId).emit("MessageReceived", {
        userName,
        text,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
