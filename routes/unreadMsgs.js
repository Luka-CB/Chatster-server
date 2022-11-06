const router = require("express").Router();

const {
  createUnreadMsg,
  getUnreadMsgs,
  removeUnreadMsgs,
} = require("../controllers/unreadMsgs");
const auth = require("../middlewares/auth");

router.route("/create").post(auth, createUnreadMsg);
router.route("/fetch").get(auth, getUnreadMsgs);
router.route("/remove/:senderId").delete(auth, removeUnreadMsgs);

module.exports = router;
