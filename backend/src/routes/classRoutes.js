const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { authorizeRoles } = require("../middleware/authMiddleware");

// List and create classes
router.get("/", authorizeRoles("admin", "teacher", "student"), classController.getClasses);
router.post("/", authorizeRoles("admin"), classController.createClass);

// Teacher management
router.post("/teachers/add", authorizeRoles("admin"), classController.addTeacherToClass);
router.post("/teachers/remove", authorizeRoles("admin"), classController.removeTeacherFromClass);

// Student management
router.post("/students/add", authorizeRoles("admin"), classController.addStudentToClass);
router.post("/students/remove", authorizeRoles("admin"), classController.removeStudentFromClass);

// Lesson management
router.post("/lessons/assign", authorizeRoles("admin"), classController.assignLessonToStudent);
router.post("/lessons/remove", authorizeRoles("admin"), classController.removeLessonFromStudent);

// Get specific resources (must be after POST routes)
router.get("/lessons/:id", authorizeRoles("admin", "student", "parent"), classController.getStudentLessons);
router.get("/:id/students", authorizeRoles("admin", "teacher", "student"), classController.getClassStudents);
router.get("/:id", authorizeRoles("admin", "teacher", "student"), classController.getClassById);

// Update and delete classes
router.put("/:id", authorizeRoles("admin"), classController.updateClass);
router.delete("/:id", authorizeRoles("admin"), classController.deleteClass);

module.exports = router;
