const router = require("express").Router();
const {
  createMessage,
  fetchMessages,
  createGroupMessage,
  fetchGroupMessages,
} = require("../controllers/messages");
const auth = require("../middlewares/auth");

router.route("/create").post(auth, createMessage);
router.route("/create-group-message").post(auth, createGroupMessage);
router.route("/fetch/:chatId").get(auth, fetchMessages);
router.route("/fetch-group-messages/:groupId").get(auth, fetchGroupMessages);

module.exports = router;
