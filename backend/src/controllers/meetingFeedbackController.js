const meetingFeedbackModel = require("../models/meetingFeedbackModel");
const responseHandler = require("../utils/responseHandler");

const createFeedback = async (req, res, next) => {
  try {
    const { meeting_id , student_id, teacher_id, feedback, media_url } = req.body;

    const result = await meetingFeedbackModel.createFeedback(
      meeting_id ,
      student_id,
      teacher_id,
      feedback,
      media_url
    );

    responseHandler.success(res, 201, result, "Feedback created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", meeting_id = null } = req.query;
    
    // Filter by role:
    // - students see only their own feedback
    // - parents see their children's feedback
    // - admin/teacher see all feedback
    let student_id = null;
    let parent_id = null;
    
    if (req.user.role === 'student') {
      student_id = req.user.id;
    } else if (req.user.role === 'parent') {
      parent_id = req.user.id;
    }
    
    const feedbacks = await meetingFeedbackModel.getFeedbacks(page, limit, search, meeting_id, student_id, parent_id);
    responseHandler.success(res, 200, feedbacks);
  } catch (err) {
    next(err);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    let student_id = null;
    let parent_id = null;
    
    if (req.user.role === 'student') {
      student_id = req.user.id;
    } else if (req.user.role === 'parent') {
      parent_id = req.user.id;
    }
    
    const feedback = await meetingFeedbackModel.getFeedbackById(req.params.id, student_id, parent_id);
    if (!feedback) return responseHandler.notFound(res, "Feedback not found");
    responseHandler.success(res, 200, feedback);
  } catch (err) {
    next(err);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const { feedback, media_url } = req.body;
    const result = await meetingFeedbackModel.updateFeedback(req.params.id, feedback, media_url);
    if (!result) return responseHandler.notFound(res, "Feedback not found");
    responseHandler.success(res, 200, result, "Feedback updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await meetingFeedbackModel.deleteFeedback(req.params.id);
    if (!feedback) return responseHandler.notFound(res, "Feedback not found");
    responseHandler.success(res, 200, feedback, "Feedback deleted successfully", "DELETED");
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

