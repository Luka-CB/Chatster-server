const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Request = require("../models/Request");
const Group = require("../models/Group");
const GroupRequest = require("../models/GroupRequest");

// CREATE NEW FRIEND REQUEST
// ROUTE - POST - /api/requests/create
// PRIVATE - USER
const createRequest = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  const requestExists = await Request.findOne({
    from: req.user._id,
    to: userId,
  });

  if (requestExists) {
    await User.updateOne(
      { _id: userId },
      { $pull: { friendRequests: requestExists._id } }
    );
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { mySentRequests: requestExists._id } }
    );

    await Request.deleteOne({ _id: requestExists._id });
  } else {
    const newRequest = await Request.create({
      from: req.user._id,
      to: userId,
    });

    if (!newRequest) throw new Error("Create New Request was not Successful!");

    await User.updateOne(
      { _id: userId },
      { $push: { friendRequests: newRequest._id } }
    );
    await User.updateOne(
      { _id: req.user._id },
      { $push: { mySentRequests: newRequest._id } }
    );
  }

  res.status(200).json({ msg: "success" });
});

// GET USER REQUESTS
// ROUTE - GET - /api/requests/fetch-my
// PRIVATE - USER
const myRequests = asyncHandler(async (req, res) => {
  const user = await User.findOne(
    { _id: req.user._id },
    "friendRequests"
  ).exec();

  if (user.friendRequests.length > 0) {
    const requests = await Request.find({
      _id: { $in: user.friendRequests },
    }).populate("from", "username avatar");

    const count = await Request.countDocuments({
      _id: { $in: user.friendRequests },
    });

    res.status(200).json({ requests, count });
  } else {
    res.json({ msg: "No Friend Requests!" });
  }
});

// ACCEPT REQUEST
// ROUTE - PUT - /api/requets/accept/:id
// PRIVATE - USER
const acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let request = await Request.findById(id);

  if (!request.isConfirmed) {
    request = await Request.findOneAndUpdate(
      { _id: id },
      { isConfirmed: true },
      { new: true }
    );
  }

  if (request.isConfirmed) {
    await User.updateOne(
      { _id: req.user._id },
      { $push: { friends: request.from } }
    );
    await User.updateOne(
      { _id: request.from },
      { $push: { friends: req.user._id } }
    );

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { friendRequests: request._id } }
    );
    await User.updateOne(
      { _id: request.from },
      { $pull: { mySentRequests: request._id } }
    );

    await Request.deleteOne({ _id: request._id });

    res.status(200).send("success");
  } else {
    throw new Error("Something went wrong!");
  }
});

// REJECT REQUEST
// ROUTE - DELETE - /api/requests/reject/:id
// PRIVATE - USER
const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRequest = await Request.findOneAndDelete({ _id: id });

  if (!deletedRequest) throw new Error("Something went wrong!");

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { friendRequests: deletedRequest._id } }
  );
  await User.updateOne(
    { _id: deletedRequest.from },
    { $pull: { mySentRequests: deletedRequest._id } }
  );

  res.status(200).send("success");
});

// SEND GROUP REQUEST OR UNSEND
// ROUTE - POST - /api/requests/group-req
// PRIVATE - USER
const sendOrUnsendRequest = asyncHandler(async (req, res) => {
  const { groupId } = req.query;

  const alreadySent = await GroupRequest.findOne({
    from: req.user._id,
    to: groupId,
  });

  if (!alreadySent) {
    const newRequest = await GroupRequest.create({
      from: req.user._id,
      to: groupId,
    });

    if (!newRequest) throw new Error("Somethin went wrong!");

    await Group.updateOne(
      { _id: groupId },
      { $push: { requests: newRequest._id } }
    );
  } else {
    const deletedRequest = await GroupRequest.deleteOne({
      _id: alreadySent._id,
    });

    if (!deletedRequest) throw new Error("Somethin went wrong!");

    await Group.updateOne(
      { _id: groupId },
      { $pull: { requests: alreadySent._id } }
    );
  }

  res.status(200).send("success");
});

// FETCH GROUP REQUESTS
// ROUTE - GET - /api/requests/fetch-group-reqs/:groupId
// PRIVATE - USER
const fetchGroupRequests = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId);

  if (!group) throw new Error("Group does not Exists!");

  const requests = await GroupRequest.find(
    { _id: { $in: group.requests } },
    "from"
  ).populate("from", "username avatar");

  res.status(200).json(requests);
});

// ACCEPT GROUP REQUEST
// ROUTE - PUT - /api/requests/accept-group-req/:reqId
// PRIVATE - USER
const acceptGroupRequest = asyncHandler(async (req, res) => {
  const { reqId } = req.params;

  const request = await GroupRequest.findById(reqId);

  if (!request) throw new Error("Something went wrong!");

  await Group.updateOne(
    { _id: request.to },
    { $push: { members: request.from } }
  );
  await Group.updateOne(
    { _id: request.to },
    { $pull: { requests: request._id } }
  );
  await GroupRequest.deleteOne({ _id: reqId });

  res.status(200).send("success");
});

// REJECT GROUP REQUEST
// ROUTE - PUT - /api/requests/reject-group-req/:reqId
// PRIVATE - USER
const rejectGroupRequest = asyncHandler(async (req, res) => {
  const { reqId } = req.params;

  const request = await GroupRequest.findById(reqId);

  if (!request) throw new Error("Something went wrong!");

  await Group.updateOne(
    { _id: request.to },
    { $pull: { requests: request._id } }
  );
  await GroupRequest.deleteOne({ _id: reqId });

  res.status(200).send("success");
});

module.exports = {
  createRequest,
  myRequests,
  acceptRequest,
  rejectRequest,
  sendOrUnsendRequest,
  fetchGroupRequests,
  acceptGroupRequest,
  rejectGroupRequest,
};
