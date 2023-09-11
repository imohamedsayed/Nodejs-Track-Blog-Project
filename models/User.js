const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { deleteImage } = require("../helpers/images");

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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    trim: true,
    default: "/images/user.jpg",
  },
  tokens: {
    type: [
      {
        type: String,
        expires: "1d",
        trim: true,
      },
    ],
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.pre("deleteOne", async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());
    if (!user) {
      return next();
    }
    if (user.image !== "/images/user.jpg") {
      deleteImage(user.image);
    }

    next();
  } catch (error) {
    next(error);
  }
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
UserSchema.statics.changePassword = async function ({
  id,
  oldPassword,
  newPassword,
}) {
  const user = await this.findById(id);
  const passwordFlag = await bcrypt.compare(oldPassword, user.password);
  if (passwordFlag) {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.findByIdAndUpdate(id, {
      password: hashed,
    });

    const updatedUser = await this.findById(id);

    return updatedUser;
  } else {
    throw Error("Incorrect old Password");
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
  // delete userObj.tokens;

  return userObj;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
