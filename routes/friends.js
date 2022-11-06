const router = require("express").Router();
const { getFriends, unfriend } = require("../controllers/friends");
const auth = require("../middlewares/auth");

router.route("/fetch-all").get(auth, getFriends);
router.route("/remove/:id").put(auth, unfriend);

module.exports = router;
