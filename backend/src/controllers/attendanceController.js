const attendanceModel = require("../models/attendanceModel");

const markAttendance = async (req, res) => {
  try {
    const { student_id, meeting_id, lesson_id, status } = req.body;

    const attendance = await attendanceModel.markAttendance(
      student_id,
      meeting_id,
      lesson_id,
      status
    );

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", meeting_id = null } = req.query;
    const attendance = await attendanceModel.getAttendance(page, limit, search, meeting_id);
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await attendanceModel.getAttendanceById(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const attendance = await attendanceModel.updateAttendance(req.params.id, status);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceModel.deleteAttendance(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json({ message: "Attendance deleted", attendance });
  } catch (err) {
    next(err);
  }
};

// Get student's active meetings
const getStudentActiveMeetings = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const meetings = await attendanceModel.getStudentActiveMeetings(student_id);
    res.json({ data: meetings });
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
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate code format (6 digits)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({ message: "Invalid code format. Must be 6 digits." });
    }
    
    // Validate that student_id and meeting_id are valid integers
    if (isNaN(student_id) || isNaN(meeting_id)) {
      return res.status(400).json({ message: "Invalid student_id or meeting_id" });
    }

    const attendance = await attendanceModel.submitAttendanceCode(student_id, meeting_id, code);
    if (!attendance) {
      return res.status(500).json({ message: "Failed to submit attendance code" });
    }

    res.json({ data: attendance, message: "Code submitted successfully" });
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
    res.json(result);
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
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ 
      data: attendance, 
      message: `Attendance ${approved ? 'approved' : 'rejected'} successfully` 
    });
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
  approveAttendance
};