const User = require("../models/User");

const { AuthErrors } = require("../helpers/HandleValidationErrors");
const loggerEvent = require("../services/logger.service");
const { getImage, deleteImage } = require("../helpers/images");

const logger = loggerEvent("user");

const profile = async (req, res) => {
  try {
    const { user } = req;
    logger.info(`User ${user.email} in his profile page`);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
const changePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "You must provide a new profile picture" });
    }

    let image = getImage(req.file);
    if (!image) {
      return res
        .status(400)
        .json({ message: "Only .png, .jpg and .jpeg formats are allowed" });
    }

    const oldImage = req.user.image;
    if (oldImage !== "/images/user.jpg") {
      deleteImage(oldImage);
    }
    logger.info("User: " + req.user.name + "changed his//her profile picture");
    await User.findByIdAndUpdate(req.user._id, { image });

    res
      .status(200)
      .json({ message: "Profile picture has been updated successfully" });
  } catch (error) {
    logger.error(error.message);

    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};
const changePassword = async (req, res) => {
  const id = req.user._id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.changePassword({
      id,
      oldPassword,
      newPassword,
    });
    logger.info("User: " + req.user.name + "changed his//her password");
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    logger.error(error.message);
    const { errors, message } = AuthErrors(err);
    res.status(400).json({ errors, message });
  }
};

const update_user = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );
    res.status(200).json({ user, message: "User updated successfully" });
    logger.info("User: " + req.user._id + " updated his info");
  } catch (error) {
    logger.error(error.message);
    const { errors, message } = AuthErrors(error);
    res.status(400).json({ errors, message });
  }
};

module.exports = {
  profile,
  changePassword,
  changePicture,
  update_user,
};
