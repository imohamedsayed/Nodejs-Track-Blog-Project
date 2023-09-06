const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loggerEvent = require("../services/logger.service");
const logger = loggerEvent("auth.middleware");

const requireAuth = (req, res, next) => {
  const [, token] = req.cookies?.jwt?.split(" ");
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Invalid token" });
        logger.warning("Invalid token");
      } else {
        let user = await User.findById(decodedToken.id);
        if (user) {
          if (user.tokens.includes(token)) {
            delete user.tokens;
            req.user = user;
            next();
          } else {
            res.status(401).json({ message: "You are not authorized" });
          }
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

const requireAdmin = (req, res, next) => {
  try {
    requireAuth(req, res, () => {
      if (!req.user.isAdmin) {
        res.status(403).json({ message: "You are not authorized admin" });
      } else {
        next();
      }
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Something went wrong, try again later." });
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
};
