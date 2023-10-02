const Blog = require("../models/Blog");
const { BlogErrors } = require("../helpers/HandleValidationErrors");
const { getImage, deleteImage } = require("../helpers/images");
const loggerEvent = require("../services/logger.service");
const logger = loggerEvent("blog");

const add_blog = async (req, res) => {
  let image;

  try {
    if (req.file) {
      image = getImage(req.file);
    }
    const { title, body } = req.body;
    const user = req.user;

    const blog = await Blog.create({
      user: user._id,
      title,
      body,
      image,
    });
    logger.info(blog);
    res.status(201).json({ blog, message: "Blog created successfully" });
  } catch (error) {
    if (image) {
      deleteImage(image);
    }
    logger.error(error.message);

    const { errors, message } = BlogErrors(error);
    if (errors || message) res.status(400).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong, try again later" });
  }
};
const get_my_blogs = async (req, res) => {
  try {
    let blogs = await Blog.find({ user: req.user._id }).populate("user");
    logger.info("user: " + req.user.name + " viewed his blogs");

    res.status(200).json({ blogs });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Something went wrong, try again later" });
  }
};
const get_all_blogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user");
    logger.info("Admin: " + req.user.name + "Retrieved all blogs");
    res.status(200).json({ blogs });
  } catch (error) {
    logger.error("Error in getting all the blogs: " + error.message);
    res.status(500).json({ message: "Something went wrong, try again later." });
  }
};
const get_blog = async (req, res) => {
  const { id } = req.params;
  try {
    let blog = await Blog.findById(id).populate("user");
    delete blog.user.tokens;
    logger.info(blog);
    res.status(200).json({ blog });
  } catch (error) {
    logger.error(error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
const update_blog = async (req, res) => {
  let image;
  try {
    if (req.file) {
      image = getImage(req.file);
    }
    const blog = await Blog.findOne({ _id: req.params.id, user: req.user._id });

    if (!blog) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this blog." });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (image) {
      if (blog.image) deleteImage(blog.image);
    }

    logger.info(updatedBlog);

    res.status(200).json({ updatedBlog, message: "Blog updated successfully" });
  } catch (error) {
    if (image) {
      deleteImage(image);
    }
    logger.error(error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};
const delete_blog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.deleteOne({ _id: id, user: req.user._id });
    if (!blog.deletedCount) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }
    logger.info(blog);
    res.status(200).json({ message: "Blog has been deleted successfully" });
  } catch (error) {
    logger.error(error.message);
    res
      .status(500)
      .json({ message: "Something went wrong. please try again later." });
  }
};

module.exports = {
  add_blog,
  get_blog,
  update_blog,
  delete_blog,
  get_my_blogs,
  get_all_blogs,
};
