const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// CREATE OR GET CHAT
// ROUTE - GET - /api/chats/fetch-chat
// PRIVATE - USER
const createOrFetchChat = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const ownerChat = await Chat.findOne({
    owner: userId,
    chatWith: req.user._id,
  });
  const withChat = await Chat.findOne({
    owner: req.user._id,
    chatWith: userId,
  });

  if (!ownerChat && !withChat) {
    const newChat = await Chat.create({
      owner: req.user._id,
      chatWith: userId,
    });

    if (!newChat) throw new Error("Create New Chat Request has Failed!");

    res.status(200).send(newChat._id);
  } else {
    res.status(200).send(ownerChat ? ownerChat._id : withChat._id);
  }
});

module.exports = {
  createOrFetchChat,
};
