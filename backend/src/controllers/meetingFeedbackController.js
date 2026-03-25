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

const getFeedback = async (req, res) => {
  try {
    const feedback = await meetingFeedbackModel.getFeedback();
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await meetingFeedbackModel.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { feedback, media_url } = req.body;
    const result = await meetingFeedbackModel.updateFeedback(req.params.id, feedback, media_url);
    if (!result) return res.status(404).json({ message: "Feedback not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await meetingFeedbackModel.deleteFeedback(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted", feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback  
};

