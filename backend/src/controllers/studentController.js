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

const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", parent_id } = req.query;
    const students = await studentModel.getStudents(page, limit, search, parent_id);
    res.json(students);
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { user_id, parent_id } = req.body;
    const student = await studentModel.updateStudent(req.params.id, user_id, parent_id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentModel.deleteStudent(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted", student });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};