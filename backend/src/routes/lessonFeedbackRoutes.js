const express = require("express");
const router = express.Router();

const lessonFeedbackController = require("../controllers/lessonFeedbackController");

router.post("/", lessonFeedbackController.createFeedback);
router.get("/", lessonFeedbackController.getFeedback);

module.exports = router;