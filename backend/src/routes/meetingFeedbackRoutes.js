const express = require("express");
const router = express.Router();

const meetingFeedbackController = require("../controllers/meetingFeedbackController");

router.post("/", meetingFeedbackController.createFeedback);
router.get("/", meetingFeedbackController.getFeedback);

module.exports = router;