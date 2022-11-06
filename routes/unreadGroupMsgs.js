const router = require("express").Router();

const {
  createUnreadGroupMsg,
  getUnreadGroupMsgs,
  removeUnreadGroupMsgs,
} = require("../controllers/unreadGroupMsgs");
const auth = require("../middlewares/auth");

router.route("/create").post(auth, createUnreadGroupMsg);
router.route("/fetch").get(auth, getUnreadGroupMsgs);
router.route("/remove/:groupId").delete(auth, removeUnreadGroupMsgs);

module.exports = router;
