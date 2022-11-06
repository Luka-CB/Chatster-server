const router = require("express").Router();
const {
  createRequest,
  myRequests,
  acceptRequest,
  rejectRequest,
  sendOrUnsendRequest,
  fetchGroupRequests,
  acceptGroupRequest,
  rejectGroupRequest,
} = require("../controllers/requests");
const auth = require("../middlewares/auth");

router.route("/create").post(auth, createRequest);
router.route("/fetch-my").get(auth, myRequests);
router.route("/accept/:id").put(auth, acceptRequest);
router.route("/reject/:id").delete(auth, rejectRequest);
router.route("/group-req").post(auth, sendOrUnsendRequest);
router.route("/fetch-group-reqs/:groupId").get(auth, fetchGroupRequests);
router.route("/accept-group-req/:reqId").put(auth, acceptGroupRequest);
router.route("/reject-group-req/:reqId").put(auth, rejectGroupRequest);

module.exports = router;
