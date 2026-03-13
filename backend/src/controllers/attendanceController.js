const attendanceModel = require("../models/attendanceModel");

const markAttendance = async (req, res) => {
  try {
    const { student_id, lesson_id, status } = req.body;

    const attendance = await attendanceModel.markAttendance(
      student_id,
      lesson_id,
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

module.exports = {
  markAttendance,
  getAttendance
};