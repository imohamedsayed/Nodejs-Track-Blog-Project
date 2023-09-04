const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loggerEvent = require("../services/logger.service");
const logger = loggerEvent("auth.middleware");

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "You are not authorized" });
        logger.warning("Invalid token");
      } else {
        let user = await User.findById(decodedToken.id);
        if (user) {
          req.user = user;
          next();
        } else {
          logger.warning("user not authorized");
          res.status(401).json({ message: "You are not authorized" });
        }
      }
    });
  } else {
    logger.warning("user not authenticated");
    res.status(401).json({ message: "You are not authenticated" });
  }
};

module.exports = {
  checkUser,
};
