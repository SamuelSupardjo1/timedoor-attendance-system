const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), teacherController.getTeachers);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), teacherController.getTeacherById);
router.post("/", authenticate, authorizeRoles("admin"), teacherController.createTeacher);
router.put("/:id", authenticate, authorizeRoles("admin"), teacherController.updateTeacher);
router.delete("/:id", authenticate, authorizeRoles("admin"), teacherController.deleteTeacher);

module.exports = router;