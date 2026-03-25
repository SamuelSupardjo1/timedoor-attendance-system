const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lessonController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { lessonRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), lessonController.getLessons);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), lessonController.getLessonById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), lessonRules, validate, lessonController.createLesson);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), lessonRules, validate, lessonController.updateLesson);
router.delete("/:id", authenticate, authorizeRoles("admin"), lessonController.deleteLesson);

module.exports = router;    