const express = require("express");
const router = express.Router();

const meetingController = require("../controllers/meetingController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { meetingRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), meetingController.getMeetings);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), meetingController.getMeetingById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), meetingRules, validate, meetingController.createMeeting);
router.post("/:id/start", authenticate, authorizeRoles("admin", "teacher"), meetingController.startMeeting);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), meetingRules, validate, meetingController.updateMeeting);
router.delete("/:id", authenticate, authorizeRoles("admin"), meetingController.deleteMeeting);

module.exports = router;