const meetingFeedbackModel = require("../models/meetingFeedbackModel");

const createFeedback = async (req, res) => {
  try {
    const { meeting_id , student_id, teacher_id, feedback, media_url } = req.body;

    const result = await meetingFeedbackModel.createFeedback(
      meeting_id ,
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

const getFeedbacks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const feedbacks = await meetingFeedbackModel.getFeedbacks(page, limit);
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await meetingFeedbackModel.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const { feedback, media_url } = req.body;
    const result = await meetingFeedbackModel.updateFeedback(req.params.id, feedback, media_url);
    if (!result) return res.status(404).json({ message: "Feedback not found" });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await meetingFeedbackModel.deleteFeedback(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted", feedback });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback  
};

