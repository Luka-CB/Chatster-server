const router = require("express").Router();
const {
  register,
  logout,
  login,
  searchUser,
  updateProfile,
  getProfile,
  removeProfileImage,
  uploadProfileImage,
  deleteUser,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/search").get(auth, searchUser);
router.route("/profile").get(auth, getProfile);
router.route("/profile/update").put(auth, updateProfile);
router.route("/profile/upload_prof_img").post(auth, uploadProfileImage);
router.route("/profile/remove_prof_img").put(auth, removeProfileImage);
router.route("/delete").delete(auth, deleteUser);
router.route("/logout").get(auth, logout);

module.exports = router;
