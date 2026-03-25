const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");

router.post("/check-in", authenticate, authorizeRoles("student"), attendanceController.checkIn);
router.get("/", authenticate, authorizeRoles("admin", "teacher", "parent"), attendanceController.getAttendance);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "parent"), attendanceController.getAttendanceById);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), attendanceController.updateAttendance);
router.delete("/:id", authenticate, authorizeRoles("admin"), attendanceController.deleteAttendance);

module.exports = router;