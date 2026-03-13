const studentModel = require("../models/studentModel");

const createStudent = async (req, res) => {
  try {
    const { user_id, parent_id } = req.body;

    const student = await studentModel.createStudent(user_id, parent_id);

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await studentModel.getStudents();

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createStudent,
  getStudents
};