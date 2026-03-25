const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { teacherRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), teacherController.getTeachers);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), teacherController.getTeacherById);
router.post("/", authenticate, authorizeRoles("admin"), teacherRules, validate, teacherController.createTeacher);
router.put("/:id", authenticate, authorizeRoles("admin"), teacherRules, validate, teacherController.updateTeacher);
router.delete("/:id", authenticate, authorizeRoles("admin"), teacherController.deleteTeacher);

module.exports = router;