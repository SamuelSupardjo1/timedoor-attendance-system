const express = require("express");
const router = express.Router();

const meetingController = require("../controllers/meetingController");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingController.getMeetings);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingController.getMeetingById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), meetingController.createMeeting);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), meetingController.updateMeeting);
router.delete("/:id", authenticate, authorizeRoles("admin"), meetingController.deleteMeeting);


module.exports = router;