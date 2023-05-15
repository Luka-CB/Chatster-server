const asyncHandler = require("express-async-handler");
const cookie = require("cookie");
const generateToken = require("../config/utils");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const UnreadMsg = require("../models/UnreadMsg");
const Group = require("../models/Group");
const GroupMsg = require("../models/GroupMessage");
const GroupReq = require("../models/GroupRequest");
const UnreadGroupMsg = require("../models/UnreadGroupMsg");
const Request = require("../models/Request");
const { uploadImage, removeImage } = require("../utils/cloudinary");

// REGISTER USER
// ROUTE - POST - /api/users/register
// PUBLIC
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const usernameExists = await User.findOne({ username });
  const emailExists = await User.findOne({ email });

  if (usernameExists)
    throw new Error("User with this username already exists!");
  if (emailExists) throw new Error("User with this email already exists!");

  const newUser = await User.create({
    username,
    email,
    password,
  });

  if (!newUser) throw new Error("Registartion Failed!");

  const token = generateToken(newUser._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("simpleChatToken", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "none",
      secure: true,
      path: "/",
    })
  );

  res.status(200).json({
    id: newUser._id,
    username: newUser.username,
    providerId: newUser.providerId,
    providerName: newUser.providerName,
    avatar: newUser.avatar,
  });
});

// LOGIN USER
// ROUTER - POST - api/users/login
// PUBLIC
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) throw new Error("Username is invalid!");
  if (!(await user.matchPassword(password)))
    throw new Error("Password is Invalid!");

  const token = generateToken(user._id);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("simpleChatToken", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "none",
      secure: true,
      path: "/",
    })
  );

  res.status(200).json({
    id: user._id,
    username: user.username,
    providerId: user.providerId,
    providerName: user.providerName,
    avatar: user.avatar,
  });
});

// SEARCH USERS
// ROUTE - GET - /api/users/search
// PRIVATE - USER
const searchUser = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const keyword = q
    ? {
        username: {
          $regex: q,
          $options: "i",
        },
      }
    : {};

  const users = await User.find({ ...keyword }).populate(
    "friendRequests mySentRequests",
    "from to"
  );

  const filteredUsers = users.filter(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  if (!users) throw new Error("Somethin went wrong!");

  res.status(200).json({ users: filteredUsers, count: filteredUsers.length });
});

// GET USER PROFILE
// ROUTE - GET - /api/users/profile
// PRIVATE - USER
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) throw new Error("Get Profile Request has Failed!");

  res.status(200).json(user);
});

// UPDATE USER PROFILE
// ROUTE - PUT - /api/users/profile/update
// PRIVATE - USER
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findById(req.user._id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;
    if (password) user.password = password;
  }

  const newUser = await user.save();

  if (!newUser) throw new Error("Update User Profile Request has Failed!");

  res.status(200).send("success");
});

// UPLOAD PROFILE AVATAR
// ROUTE - POST - /api/users/upload_img
// PRIVATE - USER
const uploadProfileImage = asyncHandler(async (req, res) => {
  const { image } = req.body;

  const user = await User.findById(req.user._id);

  if (user.imageId) {
    const result = await removeImage(user.imageId);
    if (!result) throw new Error("Failed to remove image!");
  }

  const result = await uploadImage(image, "profile-images");
  if (!result) throw new Error("Failed to upload image!");

  await User.updateOne(
    { _id: req.user._id },
    { avatar: result.secure_url, imageId: result.public_id }
  );

  res
    .status(200)
    .json({ msg: "Uploaded Successfully!", addedImage: result.url });
});

// REMOVE PROFILE AVATAR
// ROUTE - PUT - /api/users/remove_img
// PRIVATE - USER
const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }, "imageId");

  const result = await removeImage(user.imageId);
  if (!result) throw new Error("Failed to remove image!");

  const updatedUser = await User.updateOne(
    { _id: req.user._id },
    { avatar: "", imageId: "" }
  );

  if (!updatedUser) throw new Error("Update User Profile Request has Failed!");

  res.status(200).send("success");
});

// REMOVE USER
// ROUTE - DELETE - /api/users/delete
// PRIVATE - USER
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // CHATS
  const chats = await Chat.find({
    $or: [{ owner: req.user._id }, { chatWith: req.user._id }],
  });

  const msgIds = chats.map((chat) => chat.messages).flat();
  const deletedMsgs = await Message.deleteMany({ _id: { $in: msgIds } });
  if (!deletedMsgs) throw new Error("Delete messages request has failed!");

  const chatIds = chats.map((chat) => chat._id);
  const deletedChats = await Chat.deleteMany({ _id: { $in: chatIds } });
  if (!deletedChats) throw new Error("Delete chats request has failed!");

  const deletedUnreadMsgs = await UnreadMsg.deleteMany({
    $or: [{ senderId: req.user._id }, { recieverId: req.user._id }],
  });
  if (!deletedUnreadMsgs)
    throw new Error("Delete unread messages request has failed!");

  // GROUPS
  const groups = await Group.find({ admin: req.user._id });
  const groupIds = groups.map((group) => group._id);

  const groupMsgIds = groups.map((group) => group.groupMessages).flat();
  const deletedGroupMsgs = await GroupMsg.deleteMany({
    _id: { $in: groupMsgIds },
  });
  if (!deletedGroupMsgs)
    throw new Error("Delete group messages request has failed!");

  const groupReqIds = groups.map((group) => group.requests).flat();
  const deletedGroupReqs = await GroupReq.deleteMany({
    _id: { $in: groupReqIds },
  });
  if (!deletedGroupReqs)
    throw new Error("Delete group requests request has failed!");

  const deletedGroupUnreadMsgs = await UnreadGroupMsg.deleteMany({
    groupId: { $in: groupIds },
  });
  if (!deletedGroupUnreadMsgs)
    throw new Error("Delete unread group messages request has failed!");

  const deletedGroups = await Group.deleteMany({ _id: { $in: groupIds } });
  if (!deletedGroups) throw new Error("Delete groups request has failed!");

  // REQUESTS
  const reqIds = [user.friendRequests, user.mySentRequests].flat();
  const deletedRequests = await Request.deleteMany({ _id: { $in: reqIds } });
  if (!deletedRequests) throw new Error("Delete requests request has failed!");

  if (user.imageId) {
    const result = removeImage(user.imageId);
    if (!result) throw new Error("Delete image request has failed!");
  }

  const deletedUser = await User.deleteOne({ _id: req.user._id });
  if (!deletedUser) throw new Error("Delete user request has failed!");

  res.status(200).json({ msg: "Deleted Successfully" });
});

// LOGOUT USER
// ROUTE - GET - /api/users/logout
// PRIVATE - USER
const logout = asyncHandler(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("simpleChatToken", "", {
      httpOnly: false,
      maxAge: new Date(0),
      sameSite: "none",
      secure: true,
      path: "/",
    })
  );

  res.send("Logged Out");
});

module.exports = {
  register,
  login,
  searchUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  deleteUser,
  logout,
};
