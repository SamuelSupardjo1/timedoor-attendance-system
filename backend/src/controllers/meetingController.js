const meetingModel = require("../models/meetingModel");
const responseHandler = require("../utils/responseHandler");

const createMeeting = async (req, res, next) => {
  try {
    const { class_id, date } = req.body;
    const meeting = await meetingModel.createMeeting(class_id, date);
    responseHandler.success(res, 201, meeting, "Meeting created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getMeetings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const meetings = await meetingModel.getMeetings(page, limit, search);
    responseHandler.success(res, 200, meetings);
  } catch (err) {
    next(err);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await meetingModel.getMeetingById(req.params.id);
    if (!meeting) return responseHandler.notFound(res, "Meeting not found");
    responseHandler.success(res, 200, meeting);
  } catch (err) {
    next(err);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const { class_id, date } = req.body;
    const meeting = await meetingModel.updateMeeting(req.params.id, class_id, date);
    if (!meeting) return responseHandler.notFound(res, "Meeting not found");
    responseHandler.success(res, 200, meeting, "Meeting updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingModel.deleteMeeting(req.params.id);
    if (!meeting) return responseHandler.notFound(res, "Meeting not found");
    responseHandler.success(res, 200, meeting, "Meeting deleted successfully", "DELETED");
  } catch (err) {
    next(err);
  }
};

const startMeeting = async (req, res, next) => {
  try {
    const success = await meetingModel.startMeeting(req.params.id);
    if (!success) return responseHandler.notFound(res, "Meeting not found");
    responseHandler.success(res, 200, null, "Meeting started, attendance records generated");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  startMeeting
};