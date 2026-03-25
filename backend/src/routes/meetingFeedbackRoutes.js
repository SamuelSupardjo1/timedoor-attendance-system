const express = require("express");
const router = express.Router();

const meetingFeedbackController = require("../controllers/meetingFeedbackController");

router.post("/", meetingFeedbackController.createFeedback);
router.get("/", meetingFeedbackController.getFeedback);
router.get("/:id", meetingFeedbackController.getFeedbackById);
router.put("/:id", meetingFeedbackController.updateFeedback);
router.delete("/:id", meetingFeedbackController.deleteFeedback);

module.exports = router;