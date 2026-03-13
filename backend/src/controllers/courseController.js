const courseModel = require("../models/courseModel");

const createCourse = async (req, res) => {
  try {
    const { course_name, description } = req.body;

    const course = await courseModel.createCourse(course_name, description);

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await courseModel.getCourses();

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createCourse,
  getCourses
};