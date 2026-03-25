const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { registerRules, loginRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;