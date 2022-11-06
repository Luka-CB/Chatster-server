const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// GET ALL FRIENDS
// ROUTE - GET - /api/friends/fetch-all
// PRIVATE - USER
const getFriends = asyncHandler(async (req, res) => {
  const friendIds = await User.findOne({ _id: req.user._id }, "friends");

  const friends = await User.find(
    { _id: { $in: friendIds.friends } },
    "username avatar"
  );

  const count = await User.countDocuments({ _id: { $in: friendIds.friends } });

  if (!friends) throw new Error("Fetch All Friends Request has Failed!");

  res.status(200).json({ friends, count });
});

// UNFRIEND
// ROUTE - PUT - /api/friends/remove/:id
// PRIVATE - USER
const unfriend = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await User.updateOne({ _id: req.user._id }, { $pull: { friends: id } });
  await User.updateOne({ _id: id }, { $pull: { friends: req.user._id } });

  res.status(200).send("success");
});

module.exports = {
  getFriends,
  unfriend,
};
