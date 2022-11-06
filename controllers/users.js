const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const cookie = require("cookie");
const generateToken = require("../config/utils");
const User = require("../models/User");

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
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "strict",
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
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7 * 30,
      sameSite: "strict",
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

// UPDATE PROFILE AVATAR
// ROUTE - PUT - /api/users/profile/update_prof_img
// PRIVATE - USER
const updateProfileImage = asyncHandler(async (req, res) => {
  const { imageUrl, publicId } = req.body;

  const user = await User.findOne({ _id: req.user._id }, "avatar imageId");

  if (user.avatar && user.imageId) {
    await cloudinary.uploader.destroy(user.imageId);
  }

  const updatedUser = await User.updateOne(
    { _id: req.user._id },
    { avatar: imageUrl, imageId: publicId }
  );

  if (!updatedUser) throw new Error("Update Avatar Request has Failed!");

  res.status(200).send("success");
});

// REMOVE PROVILE AVATAR
// ROUTE - PUT - /api/users/profile/remove_prof_img
// PRIVATE - USER
const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }, "imageId");

  await cloudinary.uploader.destroy(user.imageId);

  const updatedUser = await User.updateOne(
    { _id: req.user._id },
    { avatar: "", imageId: "" }
  );

  if (!updatedUser) throw new Error("Update User Profile Request has Failed!");

  res.status(200).send("success");
});

// LOGOUT USER
// ROUTE - GET - /api/users/logout
// PRIVATE - USER
const logout = asyncHandler(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("simpleChatToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV !== "development",
      maxAge: new Date(0),
      sameSite: "strict",
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
  updateProfileImage,
  removeProfileImage,
  logout,
};
