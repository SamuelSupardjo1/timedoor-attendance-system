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

const getCourseById = async (req, res) => {
  try {
    const course = await courseModel.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { course_name, description } = req.body;
    const course = await courseModel.updateCourse(req.params.id, course_name, description);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await courseModel.deleteCourse(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};