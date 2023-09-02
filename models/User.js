const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
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
});

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
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

const User = mongoose.model("User", UserSchema);

module.exports = User;
