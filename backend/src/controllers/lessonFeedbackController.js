const lessonFeedbackModel = require("../models/lessonFeedbackModel");

const createFeedback = async (req, res) => {
  try {
    const { lesson_id, student_id, teacher_id, feedback, media_url } = req.body;

    const result = await lessonFeedbackModel.createFeedback(
      lesson_id,
      student_id,
      teacher_id,
      feedback,
      media_url
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedback = await lessonFeedbackModel.getFeedback();
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createFeedback,
  getFeedback
};