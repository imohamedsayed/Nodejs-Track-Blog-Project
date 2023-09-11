const mongoose = require("mongoose");
const { deleteImage, deleteImages } = require("../helpers/images");

let d = new Date();
let todayDate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

const BLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Blog must belong to a specific user"],
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Blog title is required"],
  },
  body: {
    type: String,
    trim: true,
    required: [true, "Blog content is required"],
  },
  image: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    default: todayDate,
  },
});

BLogSchema.pre("deleteOne", async function (next) {
  try {
    const blog = await this.model.findOne(this.getQuery());

    if (!blog) {
      return next();
    }

    deleteImage(blog.image);
    next();
  } catch (error) {
    next(error);
  }
});
BLogSchema.pre("deleteMany", async function (next) {
  try {
    const blogs = await this.model.find(this.getQuery());

    const imagePathsToDelete = blogs.flatMap((blog) => blog.image);

    deleteImages(imagePathsToDelete);

    next();
  } catch (error) {
    next(error);
  }
});

const Blog = mongoose.model("Blog", BLogSchema);

module.exports = Blog;
