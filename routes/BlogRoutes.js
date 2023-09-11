const router = require("express").Router();
const BlogController = require("../controllers/BlogController");
const { requireAuth, requireAdmin } = require("../middleware/AuthMiddleware");
const { upload } = require("../middleware/UploadMiddleware");
const multer = require("multer");

router.post("/", requireAuth, upload.single("image"), BlogController.add_blog);

router.patch(
  "/:id",
  requireAuth,
  upload.single("image"),
  BlogController.update_blog
);

router.delete("/:id", requireAuth, BlogController.delete_blog);

router.get("/", requireAdmin, BlogController.get_all_blogs);

router.get("/my_blogs", requireAuth, BlogController.get_my_blogs);

router.get("/:id", BlogController.get_blog);

// Multer images errors {fileSize and files format}
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === "Please select an image") {
    return res.status(400).json({ error: err.message });
  }
  res
    .status(500)
    .json({ message: "Something went wrong, please try again later." });
});

module.exports = router;
