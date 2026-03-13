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

module.exports = {
  createTeacher,
  getTeachers
};