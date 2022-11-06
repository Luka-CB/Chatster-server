const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      default: "",
    },
    providerId: {
      type: String,
      default: "",
    },
    providerName: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    imageId: {
      type: String,
    },
    password: {
      type: String,
      trim: true,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }],
    mySentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }],
    mySentGroupRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "GroupRequest" },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password) {
    if (!this.isModified("password")) next();

    this.password = await bcrypt.hash(this.password, 8);
  }
});

userSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
