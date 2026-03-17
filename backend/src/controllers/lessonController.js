const lessonModel = require("../models/lessonModel");

const { createLesson: createLessonModel } = require("../models/lessonModel");

const createLesson = async (req, res) => {
  try {
    const { course_id, lesson_number, lesson_name } = req.body;
    const lesson = await createLessonModel(course_id, lesson_number, lesson_name);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLessons = async (req, res) => {
  try {
    const lessons = await lessonModel.getLessons();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createLesson,
  getLessons
};