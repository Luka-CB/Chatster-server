const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const auth = asyncHandler(async (req, res, next) => {
  if (req.headers.cookie) {
    try {
      const { simpleChatToken } = cookie.parse(req.headers.cookie);
      const { simpleChatOauthSession } = cookie.parse(req.headers.cookie);

      if (simpleChatToken || (simpleChatToken && simpleChatOauthSession)) {
        const decoded = jwt.verify(simpleChatToken, process.env.SESSION_SECRET);
        req.user = await User.findById(decoded.id).select("_id username");
        next();
      }

      if (
        simpleChatOauthSession &&
        simpleChatOauthSession.length > 50 &&
        !simpleChatToken
      ) {
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized, Token");
    }
  }
});

module.exports = auth;
