const User = require("../models/User");

const loggerEvent = require("../services/logger.service");
const logger = loggerEvent("user");

const profile = async (req, res) => {
  try {
    const { user } = req;
    
    res.status(200).json({ user });
  } catch (error) {
    logger.error(error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

module.exports = {
  profile,
};
