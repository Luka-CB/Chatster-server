const mongoose = require("mongoose");

const unreadMsgSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("UnreadMsg", unreadMsgSchema);
