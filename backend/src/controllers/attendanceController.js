const attendanceModel = require("../models/attendanceModel");
const responseHandler = require("../utils/responseHandler");

const markAttendance = async (req, res, next) => {
  try {
    const { student_id, meeting_id, lesson_id, status } = req.body;

    const attendance = await attendanceModel.markAttendance(
      student_id,
      meeting_id,
      lesson_id,
      status
    );

    responseHandler.success(res, 201, attendance, "Attendance marked", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", meeting_id = null } = req.query;
    
    // If user is a parent, only show their children's attendance
    const parent_id = req.user.role === 'parent' ? req.user.id : null;
    
    const attendance = await attendanceModel.getAttendance(page, limit, search, meeting_id, parent_id);
    responseHandler.success(res, 200, attendance);
  } catch (err) {
    next(err);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    // If user is a parent, they can only see their children's attendance
    const parent_id = req.user.role === 'parent' ? req.user.id : null;
    
    const attendance = await attendanceModel.getAttendanceById(req.params.id, parent_id);
    if (!attendance) return responseHandler.notFound(res, "Attendance not found");
    responseHandler.success(res, 200, attendance);
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const attendance = await attendanceModel.updateAttendance(req.params.id, status);
    if (!attendance) return responseHandler.notFound(res, "Attendance not found");
    responseHandler.success(res, 200, attendance, "Attendance updated", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceModel.deleteAttendance(req.params.id);
    if (!attendance) return responseHandler.notFound(res, "Attendance not found");
    responseHandler.success(res, 200, attendance, "Attendance deleted", "DELETED");
  } catch (err) {
    next(err);
  }
};

// Get student's active meetings
const getStudentActiveMeetings = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const meetings = await attendanceModel.getStudentActiveMeetings(student_id);
    responseHandler.success(res, 200, meetings);
  } catch (err) {
    next(err);
  }
};

// Submit attendance code
const submitAttendanceCode = async (req, res, next) => {
  try {
    const { student_id, meeting_id, code } = req.body;
    
    // Validate required fields
    if (!student_id || !meeting_id || !code) {
      return responseHandler.error(res, 400, "Missing required fields", "MISSING_FIELD");
    }
    
    // Validate code format (6 digits)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return responseHandler.error(res, 400, "Invalid code format. Must be 6 digits.", "INVALID_CODE_FORMAT");
    }
    
    // Validate that student_id and meeting_id are valid integers
    if (isNaN(student_id) || isNaN(meeting_id)) {
      return responseHandler.error(res, 400, "Invalid student_id or meeting_id", "INVALID_INPUT");
    }

    const attendance = await attendanceModel.submitAttendanceCode(student_id, meeting_id, code);
    if (!attendance) {
      return responseHandler.error(res, 500, "Failed to submit attendance code", "INTERNAL_ERROR");
    }

    responseHandler.success(res, 200, attendance, "Code submitted successfully");
  } catch (err) {
    next(err);
  }
};

// Get pending attendance for teacher approval
const getPendingAttendance = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await attendanceModel.getPendingAttendance(teacher_id, page, limit);
    responseHandler.success(res, 200, result);
  } catch (err) {
    next(err);
  }
};

// Approve or reject attendance
const approveAttendance = async (req, res, next) => {
  try {
    const { attendance_id } = req.params;
    const { approved } = req.body;

    const attendance = await attendanceModel.approveAttendance(attendance_id, approved);
    if (!attendance) {
      return responseHandler.notFound(res, "Attendance record not found");
    }

    responseHandler.success(res, 200, attendance, `Attendance ${approved ? 'approved' : 'rejected'} successfully`);
  } catch (err) {
    next(err);
  }
};

// Resubmit attendance code (for rejected submissions)
const resubmitAttendanceCode = async (req, res, next) => {
  try {
    const { student_id, meeting_id, code } = req.body;
    
    // Validate required fields
    if (!student_id || !meeting_id || !code) {
      return responseHandler.error(res, 400, "Missing required fields", "MISSING_FIELD");
    }
    
    // Validate code format (6 digits)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return responseHandler.error(res, 400, "Invalid code format. Must be 6 digits.", "INVALID_CODE_FORMAT");
    }
    
    // Validate that student_id and meeting_id are valid integers
    if (isNaN(student_id) || isNaN(meeting_id)) {
      return responseHandler.error(res, 400, "Invalid student_id or meeting_id", "INVALID_INPUT");
    }

    const attendance = await attendanceModel.resubmitAttendanceCode(student_id, meeting_id, code);
    if (!attendance) {
      return responseHandler.error(res, 400, "Attendance record not found or is not in rejected status", "NOT_FOUND");
    }

    responseHandler.success(res, 200, attendance, "Code resubmitted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getStudentActiveMeetings,
  submitAttendanceCode,
  getPendingAttendance,
  approveAttendance,
  resubmitAttendanceCode
};