const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const GroupMessage = require("../models/GroupMessage");
const Group = require("../models/Group");

// CREATE MESSAGE
// ROUTE - POST - /api/messages/create
// PRIVATE - USER
const createMessage = asyncHandler(async (req, res) => {
  const { message, date, chatId } = req.body;

  const newMessage = await Message.create({
    author: req.user._id,
    message,
    date,
  });

  if (!newMessage) throw new Error("Create New Message Request has Failed!");

  await Chat.updateOne(
    { _id: chatId },
    { $push: { messages: newMessage._id } }
  );

  res.status(200).send("success");
});

// CREATE GROUP MESSAGE
// ROUTE - POST - /api/messages/create-group-message
// PRIVATE - USER
const createGroupMessage = asyncHandler(async (req, res) => {
  const { message, date, groupId } = req.body;

  const newMessage = await GroupMessage.create({
    author: req.user._id,
    message,
    date,
  });

  if (!newMessage) throw new Error("Create New Message Request has Failed!");

  await Group.updateOne(
    { _id: groupId },
    { $push: { groupMessages: newMessage._id } }
  );

  res.status(200).send("success");
});

// GET CHAT MESSAGES
// ROUTE - GET - /api/messages/fetch/:chatId
// PRIVATE - USER
const fetchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({ _id: chatId }).populate(
    "owner chatWith",
    "username"
  );

  const messages = await Message.find({
    _id: { $in: chat.messages },
  }).populate("author", "username");

  if (!messages) throw new Error("Get Messages Request has Failed!");

  res.status(200).json({ messages, userIds: [chat.owner, chat.chatWith] });
});

// GET GROUP MESSAGES
// ROUTE - GET - /api/messages/fetch-group-messages/:groupId
// PRIVATE - USER
const fetchGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findOne({ _id: groupId });

  const messages = await GroupMessage.find({
    _id: { $in: group.groupMessages },
  }).populate("author", "username");

  if (!messages) throw new Error("Get Messages Request has Failed!");

  res.status(200).json(messages);
});

module.exports = {
  createMessage,
  createGroupMessage,
  fetchMessages,
  fetchGroupMessages,
};
