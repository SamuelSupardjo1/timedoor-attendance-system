const lessonModel = require("../models/lessonModel");

const { createLesson: createLessonModel } = require("../models/lessonModel");

const createLesson = async (req, res, next) => {
  try {
    const { course_id, lesson_number, lesson_name } = req.body;
    const lesson = await createLessonModel(course_id, lesson_number, lesson_name);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
};

const getLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", course_id = null } = req.query;
    
    // If user is a student, only show lessons from their enrolled courses
    const student_id = req.user.role === 'student' ? req.user.id : null;
    
    const lessons = await lessonModel.getLessons(page, limit, search, course_id, student_id);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    // If user is a student, they can only see lessons from their enrolled courses
    const student_id = req.user.role === 'student' ? req.user.id : null;
    
    const lesson = await lessonModel.getLessonById(req.params.id, student_id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    next(err);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const { course_id, lesson_number, lesson_name } = req.body;
    const lesson = await lessonModel.updateLesson(req.params.id, course_id, lesson_number, lesson_name);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    next(err);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await lessonModel.deleteLesson(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted", lesson });
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