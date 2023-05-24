const router = require("express").Router();
const passport = require("passport");

router.get("/user-data", (req, res) => {
  if (req.user)
    res.json({
      id: req.user._id,
      username: req.user.username,
      providerId: req.user.providerId,
      providerName: req.user.providerName,
      avatar: req.user.avatar,
    });
});

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_REDIRECT_URL
        : "https://chatster-orcin.vercel.app/redirect",
    failureRedirect: "/login/failed",
  })
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "user_location"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_REDIRECT_URL
        : "https://chatster-orcin.vercel.app/redirect",
    failureRedirect: "/login/failed",
  })
);

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect(
    process.env.NODE_ENV === "development"
      ? process.env.CLIENT_REDIRECT_URL
      : "https://chatster-orcin.vercel.app"
  );
});

module.exports = router;
