const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUser = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user exists with id: ${req.params.id}`
    );
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new CustomError.BadRequestError("Please provide Name and Email");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  await user.save;

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide both Old Password and New Password"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      "Old Password is wrong, please provide the correct password"
    );
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success, Password Updated" });
};

module.exports = {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
