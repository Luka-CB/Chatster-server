const asyncHandler = require("express-async-handler");
const UnreadGroupMsg = require("../models/UnreadGroupMsg");

// CREATE UNREAD GROUP MESSAGE
// ROUTE - POST - /api/unread-group-msgs/create
// PRIVATE - USER
const createUnreadGroupMsg = asyncHandler(async (req, res) => {
  const { message, recieverIds, groupId } = req.body;

  recieverIds.forEach(async (recieverId) => {
    const newMsg = await UnreadGroupMsg.create({
      message,
      senderId: req.user._id,
      recieverId: recieverId,
      groupId,
    });

    if (!newMsg)
      throw new Error("Create Unread Group Message Request has Failed!");
  });

  res.status(200).send("success");
});

// FETCH UNREAD GROUP MESSAGES
// ROUTE - GET - /api/unread-group-msgs/fetch
// PRIVATE - USER
const getUnreadGroupMsgs = asyncHandler(async (req, res) => {
  const msgs = await UnreadGroupMsg.find({ recieverId: req.user._id });

  if (!msgs) throw new Error("Fetch Unread Group Messages Request has Failed!");

  res.status(200).json(msgs);
});

// REMOVE UNREAD GROUP MESSAGES
// ROUTE - DELETE - /api/unread-group-msgs/remove/:groupId
// PRIVATE - USER
const removeUnreadGroupMsgs = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const removedMsgs = await UnreadGroupMsg.deleteMany({
    groupId,
    recieverId: req.user._id,
  });

  if (!removedMsgs)
    throw new Error("Remove Unread Messages Request has Failed!");

  res.status(200).send("success");
});

module.exports = {
  createUnreadGroupMsg,
  getUnreadGroupMsgs,
  removeUnreadGroupMsgs,
};
