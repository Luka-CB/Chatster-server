const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatWith: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
