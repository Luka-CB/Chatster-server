let users = [];
let groups = [];
let groupChatUsers = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUsers = () => {
  return users;
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const addGroup = (groupId) => {
  !groups.some((group) => group.id === groupId) && groups.push({ id: groupId });
};

const getGroups = () => groups;

const removeGroup = (groupId) => {
  groups = groups.filter((group) => group.id !== groupId);
  return groups;
};

const addGroupChatUsers = (data) => {
  !groupChatUsers.some((user) => user.userId === data.userId) &&
    groupChatUsers.push(data);
};

const getGroupChatUsers = () => groupChatUsers;

const removeGroupChatUser = (userId) => {
  groupChatUsers = groupChatUsers.filter((user) => user.userId !== userId);

  return groupChatUsers;
};

module.exports = {
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
};
