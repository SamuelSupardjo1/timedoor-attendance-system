const lessonModel = require("../models/lessonModel");
const responseHandler = require("../utils/responseHandler");
const pool = require("../config/db");

const { createLesson: createLessonModel } = require("../models/lessonModel");

const createLesson = async (req, res, next) => {
  try {
    const { course_id, lesson_number, lesson_name } = req.body;
    const lesson = await createLessonModel(course_id, lesson_number, lesson_name);
    responseHandler.success(res, 201, lesson, "Lesson created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", course_id = null } = req.query;
    
    let student_id = null;
    let parent_id = null;
    
    if (req.user.role === 'student') {
      const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      student_id = studentRes.rows[0]?.id || null;
    } else if (req.user.role === 'parent') {
      parent_id = req.user.id;
    }
    
    const lessons = await lessonModel.getLessons(page, limit, search, course_id, student_id, parent_id);
    responseHandler.success(res, 200, lessons);
  } catch (err) {
    next(err);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    let student_id = null;
    let parent_id = null;
    
    if (req.user.role === 'student') {
      const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      student_id = studentRes.rows[0]?.id || null;
    } else if (req.user.role === 'parent') {
      parent_id = req.user.id;
    }
    
    const lesson = await lessonModel.getLessonById(req.params.id, student_id, parent_id);
    if (!lesson) return responseHandler.notFound(res, "Lesson not found");
    responseHandler.success(res, 200, lesson);
  } catch (err) {
    next(err);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const { course_id, lesson_number, lesson_name } = req.body;
    const lesson = await lessonModel.updateLesson(req.params.id, course_id, lesson_number, lesson_name);
    if (!lesson) return responseHandler.notFound(res, "Lesson not found");
    responseHandler.success(res, 200, lesson, "Lesson updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await lessonModel.deleteLesson(req.params.id);
    if (!lesson) return responseHandler.notFound(res, "Lesson not found");
    responseHandler.success(res, 200, lesson, "Lesson deleted successfully", "DELETED");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson
};