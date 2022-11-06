const {
  addUser,
  removeUser,
  getUsers,
  getUser,
  addGroup,
  getGroups,
  removeGroup,
  addGroupChatUsers,
  getGroupChatUsers,
  removeGroupChatUser,
} = require("./utils");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("addUser", (userId) => {
      if (userId) {
        addUser(userId, socket.id);
      }
      const users = getUsers();
      io.emit("getUsers", users);
    });

    socket.on("sendMessage", (data) => {
      const user = getUser(data.receiverId);
      if (!user) console.log("user is not online");
      io.to(user.socketId).emit("getMessage", data);
    });

    socket.on("sendUnreadMessage", (data) => {
      const user = getUser(data.receiverId);
      if (!user) console.log("user is not online");
      io.to(user.socketId).emit("getUnreadMessage", data);
    });

    socket.on("addGroup", (groupId) => {
      if (groupId) {
        socket.join(groupId);
        addGroup(groupId);
      }
      const groups = getGroups();
      io.emit("getGroups", groups);
    });

    socket.on("sendGroupMessage", (data) => {
      io.to(data.groupId).emit("getGroupMessage", data);
    });

    socket.on("addGroupChatUsers", (data) => {
      if (data) {
        addGroupChatUsers({ ...data, socketId: socket.id });
      }
      const groupChatUsers = getGroupChatUsers();
      io.emit("getGroupChatUsers", groupChatUsers);
    });

    socket.on("removeGroupChatUser", (userId) => {
      const groupChatUsers = removeGroupChatUser(userId);
      io.emit("getGroupChatUsers", groupChatUsers);
    });

    socket.on("sendUnreadGroupMessage", (data) => {
      const onlineUsers = getUsers();
      const groupChatUsers = getGroupChatUsers();

      const users = onlineUsers.filter((onlineUser) =>
        groupChatUsers.every((user) => user.userId !== onlineUser.userId)
      );

      users.forEach((user) => {
        io.to(user.socketId).emit("getUnreadGroupMessage", data);
      });
    });

    socket.on("closeChat", (groupId) => {
      const groups = removeGroup(groupId);
      io.emit("getGroups", groups);
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
      const users = getUsers();
      io.emit("getUsers", users);
    });
  });
};
