const express = require("express");
const router = express.Router();

const meetingFeedbackController = require("../controllers/meetingFeedbackController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { feedbackRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingFeedbackController.getFeedbacks);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "student", "parent"), meetingFeedbackController.getFeedbackById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), feedbackRules, validate, meetingFeedbackController.createFeedback);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), feedbackRules, validate, meetingFeedbackController.updateFeedback);
router.delete("/:id", authenticate, authorizeRoles("admin"), meetingFeedbackController.deleteFeedback);

module.exports = router;