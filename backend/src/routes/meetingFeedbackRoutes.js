const express = require("express");
const router = express.Router();

const meetingFeedbackController = require("../controllers/meetingFeedbackController");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingFeedbackController.getFeedbacks);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingFeedbackController.getFeedbackById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), meetingFeedbackController.createFeedback);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), meetingFeedbackController.updateFeedback);
router.delete("/:id", authenticate, authorizeRoles("admin"), meetingFeedbackController.deleteFeedback);

module.exports = router;