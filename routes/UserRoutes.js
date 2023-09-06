const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { requireAuth } = require("../middleware/AuthMiddleware");

router.get("/profile", requireAuth, UserController.profile);

module.exports = router;
