const mongoose = require("mongoose");

const groupRequestSchema = mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    isConfirmed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const GroupRequest = mongoose.model("GroupRequest", groupRequestSchema);

module.exports = GroupRequest;
