const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SESSION_SECRET);
};

module.exports = generateToken;
