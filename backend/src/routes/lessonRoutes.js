const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lessonController");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), lessonController.getLessons);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), lessonController.getLessonById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), lessonController.createLesson);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), lessonController.updateLesson);
router.delete("/:id", authenticate, authorizeRoles("admin"), lessonController.deleteLesson);

module.exports = router;    