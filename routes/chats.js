const router = require("express").Router();
const { createOrFetchChat } = require("../controllers/chats");
const auth = require("../middlewares/auth");

router.route("/fetch").get(auth, createOrFetchChat);

module.exports = router;
