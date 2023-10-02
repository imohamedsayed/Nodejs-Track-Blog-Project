const router = require("express").Router();
const AuthController = require("../controllers/AuthController");

const { requireAuth } = require("../middleware/AuthMiddleware");

router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.get("/logout", requireAuth, AuthController.logout);

module.exports = router;
