const teacherModel = require("../models/teacherModel");

const createTeacher = async (req, res) => {
  try {
    const { user_id } = req.body;

    const teacher = await teacherModel.createTeacher(user_id);

    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await teacherModel.getTeachers();

    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await teacherModel.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { user_id } = req.body;
    const teacher = await teacherModel.updateTeacher(req.params.id, user_id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await teacherModel.deleteTeacher(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher deleted", teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};