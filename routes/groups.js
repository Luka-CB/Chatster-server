const router = require("express").Router();
const {
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
  deleteGroup,
} = require("../controllers/groups");
const auth = require("../middlewares/auth");

router.route("/create").post(auth, createGroup);
router.route("/fetch").get(auth, fetchGroups);
router.route("/fetch-one/:groupId").get(auth, fetchGroup);
router.route("/search").get(auth, searchGroups);
router.route("/add-member").put(auth, addMember);
router.route("/remove-member").put(auth, removeMember);
router.route("/leave/:groupId").put(auth, leaveGroup);
router.route("/update_img").put(auth, updateGroupImage);
router.route("/remove_img").put(auth, removeGroupImage);
router.route("/update_name").put(auth, updateGroupName);
router.route("/delete/:groupId").delete(auth, deleteGroup);

module.exports = router;
