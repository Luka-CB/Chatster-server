const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const Group = require("../models/Group");
const User = require("../models/User");

// CREATE GROUP
// ROUTE - POST - /api/groups/create
// PRIVATE - USER
const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const newGroup = await Group.create({
    admin: req.user._id,
    name,
  });

  if (!newGroup) throw new Error("Create New Group Request has Failed!");

  await Group.updateOne(
    { _id: newGroup._id },
    { $push: { members: req.user._id } }
  );

  res.status(200).send("success");
});

// GET GROUPS
// ROUTE - GET - /api/groups/fetch
// PRIVATE - USER
const fetchGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    members: req.user._id,
  });

  const count = await Group.countDocuments({ members: req.user._id });

  if (!groups) throw new Error("Get Groups Request has Failed!");

  res.status(200).json({ groups, count });
});

// GET GROUP BY ID
// ROUTE - GET - /api/groups/fetch-one/:groupId
// PRIVATE USER
const fetchGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId).populate("admin", "username");
  if (!group) throw new Error("Fetch Group Request has Failed!");

  const members = await User.find({ _id: { $in: group.members } });
  if (!members) throw new Error("Fetch Group Members Request has Failed!");

  res.status(200).json({ group, members });
});

// SEARCH GROUPS
// ROUTE - GET - /api/groups/search
// PRIVATE - USER
const searchGroups = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const keyword = q
    ? {
        name: {
          $regex: q,
          $options: "i",
        },
      }
    : {};

  const groups = await Group.find({ ...keyword }).populate("requests", "from");
  const filteredGroups = groups.filter(
    (group) => group.admin.toString() !== req.user._id.toString()
  );

  res
    .status(200)
    .json({ groups: filteredGroups, count: filteredGroups.length });
});

// ADD MEMBER TO THE GROUP
// ROUTE - PUT - /api/groups/add-member
// PRIVATE - USER
const addMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.query;

  const addedMember = await Group.updateOne(
    { _id: groupId },
    { $push: { members: userId } }
  );

  if (!addedMember) throw new Error("Add Member Request has Failed!");

  res.status(200).send("success");
});

// REMOVE MEMBER FROM GROUP
// ROUTE - PUT - /api/groups/remove-member
// PRIVATE - USER
const removeMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.query;

  const removedMember = await Group.updateOne(
    { _id: groupId },
    { $pull: { members: userId } }
  );

  if (!removedMember)
    throw new Error("Remove Member from Group Request has Failed!");

  res.status(200).send("success");
});

// LEAVE GROUP
// ROUTE - PUT - /api/groups/leave/:groupId
// PRIVATE - USER
const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const memberLeft = await Group.updateOne(
    { _id: groupId },
    { $pull: { members: req.user._id } }
  );

  if (!memberLeft) throw new Error("Leave Group Request has Failed!");

  res.status(200).send("success");
});

// UPDATE GROUP IMAGE
// ROUTE - PUT - /api/groups/update_img
// PRIVATE - USER
const updateGroupImage = asyncHandler(async (req, res) => {
  const { imageUrl, publicId } = req.body;
  const { groupId } = req.query;

  const group = await Group.findOne({ _id: groupId }, "image imageId");

  if (group.image && group.imageId) {
    await cloudinary.uploader.destroy(group.imageId);
  }

  const updatedGroup = await Group.updateOne(
    { _id: groupId },
    { image: imageUrl, imageId: publicId }
  );

  if (!updatedGroup) throw new Error("Update Group Image Request has Failed!");

  res.status(200).send("success");
});

// REMOVE GROUP IMAGE
// ROUTE - PUT - /api/groups/remove_img
// PRIVATE - USER
const removeGroupImage = asyncHandler(async (req, res) => {
  const { groupId } = req.query;

  const group = await Group.findOne({ _id: groupId }, "imageId");

  await cloudinary.uploader.destroy(group.imageId);

  const updatedGroup = await Group.updateOne(
    { _id: groupId },
    { image: "", imageId: "" }
  );

  if (!updatedGroup) throw new Error("Remove Group Image Request has Failed!");

  res.status(200).send("success");
});

// UPDATE GROUP NAME
// ROUTE - PUT - /api/groups/update_name
// PRIVATE - USER
const updateGroupName = asyncHandler(async (req, res) => {
  const { groupName } = req.body;
  const { groupId } = req.query;

  const updatedGroup = await Group.updateOne(
    { _id: groupId },
    { name: groupName }
  );

  if (!updatedGroup) throw new Error("Update Group Name Request has Failed!");

  res.status(200).send("success");
});

module.exports = {
  createGroup,
  fetchGroups,
  fetchGroup,
  searchGroups,
  addMember,
  removeMember,
  leaveGroup,
  updateGroupImage,
  removeGroupImage,
  updateGroupName,
};
