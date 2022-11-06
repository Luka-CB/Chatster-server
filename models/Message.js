const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
