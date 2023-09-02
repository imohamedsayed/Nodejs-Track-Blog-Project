const User = require("../models/User");

const { AuthErrors } = require("../services/HandleValidationErrors");

const signup = async (req, res) => {
  try {
    // destructing name, email and password from the request's body
    const { name, email, password } = req.body;

    //creating user account
    const user = await User.create({ name, email, password });

    res.status(201).json({ user, message: "Account created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const { errors, message } = AuthErrors(error);
      res.status(400).json({ errors, message });
    } else {
      res.status(500).json({
        message: "Something went wrong, please try again later",
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const user = await User.login({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({ user, message: "Login successful" });
  } catch (error) {
    const { errors, message } = AuthErrors(error);
    res.status(400).json({ errors, message });
  }
};

module.exports = {
  signup,
  login,
};
