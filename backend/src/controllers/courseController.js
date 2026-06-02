const courseModel = require("../models/courseModel");
const responseHandler = require("../utils/responseHandler");

const createCourse = async (req, res, next) => {
  try {
    const { course_name, description } = req.body;

    const course = await courseModel.createCourse(course_name, description);

    responseHandler.success(res, 201, course, "Course created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const courses = await courseModel.getCourses(page, limit, search);
    responseHandler.success(res, 200, courses);
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseModel.getCourseById(req.params.id);
    if (!course) return responseHandler.notFound(res, "Course not found");
    responseHandler.success(res, 200, course);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { course_name, description } = req.body;
    const course = await courseModel.updateCourse(req.params.id, course_name, description);
    if (!course) return responseHandler.notFound(res, "Course not found");
    responseHandler.success(res, 200, course, "Course updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await courseModel.deleteCourse(req.params.id);
    if (!course) return responseHandler.notFound(res, "Course not found");
    responseHandler.success(res, 200, course, "Course deleted successfully", "DELETED");
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