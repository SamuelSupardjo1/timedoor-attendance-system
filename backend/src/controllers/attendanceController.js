const attendanceModel = require("../models/attendanceModel");

const markAttendance = async (req, res) => {
  try {
    const { student_id, meeting_id , status } = req.body;

    const attendance = await attendanceModel.markAttendance(
      student_id,
      meeting_id ,
      status
    );

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await attendanceModel.getAttendance();
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
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

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
};