const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// List and create classes
router.get("/", authenticate, authorizeRoles("admin", "teacher"), classController.getClasses);
router.post("/", authenticate, authorizeRoles("admin"), classController.createClass);

// Teacher management
router.post("/teachers/add", authenticate, authorizeRoles("admin"), classController.addTeacherToClass);
router.post("/teachers/remove", authenticate, authorizeRoles("admin"), classController.removeTeacherFromClass);

// Student management
router.post("/students/add", authenticate, authorizeRoles("admin"), classController.addStudentToClass);
router.post("/students/remove", authenticate, authorizeRoles("admin"), classController.removeStudentFromClass);

// Lesson management
router.post("/lessons/assign", authenticate, authorizeRoles("admin"), classController.assignLessonToStudent);
router.post("/lessons/remove", authenticate, authorizeRoles("admin"), classController.removeLessonFromStudent);

// Get specific resources (must be after POST routes)
router.get("/lessons/:id", authenticate, authorizeRoles("admin", "student", "parent"), classController.getStudentLessons);
router.get("/:id/students", authenticate, authorizeRoles("admin", "teacher"), classController.getClassStudents);
router.get("/:id/teachers", authenticate, authorizeRoles("admin", "teacher"), classController.getClassTeachers);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), classController.getClassById);

// Update and delete classes
router.put("/:id", authenticate, authorizeRoles("admin"), classController.updateClass);
router.delete("/:id", authenticate, authorizeRoles("admin"), classController.deleteClass);

module.exports = router;
