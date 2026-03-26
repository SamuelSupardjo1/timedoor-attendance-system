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

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseModel.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { course_name, description } = req.body;
    const course = await courseModel.updateCourse(req.params.id, course_name, description);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await courseModel.deleteCourse(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted", course });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};