const asyncHandler = require("express-async-handler");
const UnreadMsg = require("../models/UnreadMsg");

// CREATE UNREAD MESSAGE
// ROUTE - POST - /api/unread-msgs/create
// PRIVATE - USER
const createUnreadMsg = asyncHandler(async (req, res) => {
  const { message, recieverId } = req.body;

  const newMsg = await UnreadMsg.create({
    message,
    senderId: req.user._id,
    recieverId,
  });

  if (!newMsg) throw new Error("Create Unread Message Request has Failed!");

  res.status(200).send("success");
});

// FETCH UNREAD MESSAGES
// ROUTE - GET - /api/unread-msgs/fetch
// PRIVATE - USER
const getUnreadMsgs = asyncHandler(async (req, res) => {
  const msgs = await UnreadMsg.find({ recieverId: req.user._id });

  if (!msgs) throw new Error("Fetch Unread Messages Request has Failed!");

  res.status(200).json(msgs);
});

// REMOVE UNREAD MESSAGES
// ROUTE - DELETE - /api/unread-msgs/remove/:senderId
// PRIVATE - USER
const removeUnreadMsgs = asyncHandler(async (req, res) => {
  const { senderId } = req.params;

  const removedMsgs = await UnreadMsg.deleteMany({ senderId });

  if (!removedMsgs)
    throw new Error("Remove Unread Messages Request has Failed!");

  res.status(200).send("success");
});

module.exports = {
  createUnreadMsg,
  getUnreadMsgs,
  removeUnreadMsgs,
};
