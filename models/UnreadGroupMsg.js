const mongoose = require("mongoose");

const unreadGroupMsgSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recieverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
});

module.exports = mongoose.model("UnreadGroupMsg", unreadGroupMsgSchema);
