const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { attendanceRules, updateAttendanceRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "parent"), attendanceController.getAttendance);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "parent"), attendanceController.getAttendanceById);
router.get("/student/:student_id/meetings", authenticate, authorizeRoles("student", "admin"), attendanceController.getStudentActiveMeetings);
router.post("/", authenticate, authorizeRoles("student"), attendanceRules, validate, attendanceController.markAttendance);
router.post("/submit-code", authenticate, authorizeRoles("student"), attendanceController.submitAttendanceCode);
router.get("/teacher/:teacher_id/pending", authenticate, authorizeRoles("teacher", "admin"), attendanceController.getPendingAttendance);
router.put("/:attendance_id/approve", authenticate, authorizeRoles("teacher", "admin"), attendanceController.approveAttendance);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), updateAttendanceRules, validate, attendanceController.updateAttendance);
router.delete("/:id", authenticate, authorizeRoles("admin"), attendanceController.deleteAttendance);

module.exports = router;