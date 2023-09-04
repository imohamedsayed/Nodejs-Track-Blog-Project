const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email is required"],
    validate: [isEmail, "Invalid email address"],
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"],
  },
  tokens: {
    type: [String],
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.statics.login = async function ({ email, password }) {
  const user = await User.findOne({ email: email });
  if (user) {
    const passwordFlag = await bcrypt.compare(password, user.password);
    if (passwordFlag) {
      return user;
    }
    throw Error("Incorrect Password");
  } else {
    throw Error("Incorrect email");
  }
};

UserSchema.methods.generateToken = async function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  this.tokens.push(token);

  await this.save();

  return token;
};

UserSchema.methods.toJSON = function () {
  const user = this;

  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;
  delete userObj.tokens;

  return userObj;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
