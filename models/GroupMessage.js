const mongoose = require("mongoose");

const groupMessageSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

module.exports = GroupMessage;
