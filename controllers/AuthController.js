const User = require("../models/User");
const { AuthErrors } = require("../helpers/HandleValidationErrors");

const loggerEvent = require("../services/logger.service");
const logger = loggerEvent("auth");

const maxAge = 1 * 24 * 60 * 60 * 1000; // one day in msec

const signup = async (req, res) => {
  try {
    logger.info(req.body);

    // destructing name, email and password from the request's body
    const { name, email, password } = req.body;

    //creating user account
    const user = await User.create({ name, email, password });
    const token = await user.generateToken();
    delete user.tokens;

    res.cookie("jwt", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: maxAge,
      sameSite: "none",
      secure: true,
    });
    res.status(201).json({ user, message: "Account created successfully" });
  } catch (error) {
    logger.error(error.message);

    const { errors, message } = AuthErrors(error);
    if (message) res.status(400).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later" });
  }
};
const login = async (req, res) => {
  try {
    logger.info(req.body);

    const user = await User.login({
      email: req.body.email,
      password: req.body.password,
    });
    delete user.tokens;

    const token = await user.generateToken();
    res.cookie("jwt", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: maxAge,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ user, message: "Login successful" });
  } catch (error) {
    logger.error(error.message);
    const { errors, message } = AuthErrors(error);
    res.status(400).json({ errors, message });
  }
};
const logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      $pull: { tokens: req.token },
    });
    res.cookie("jwt", "", { httpOnly: true, maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};
module.exports = {
  signup,
  login,
  logout,
};
