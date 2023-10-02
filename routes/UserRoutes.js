const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { requireAuth } = require("../middleware/AuthMiddleware");
const { upload } = require("../middleware/UploadMiddleware");
const multer = require("multer");

router.get("/profile", requireAuth, UserController.profile);


router.patch("/change_password", requireAuth, UserController.changePassword);

router.patch(
  "/change_picture",
  upload.single("image"),
  requireAuth,
  UserController.changePicture
);
router.patch("/", requireAuth, UserController.update_user);
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
