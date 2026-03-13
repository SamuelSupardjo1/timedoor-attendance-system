const lessonModel = require("../models/lessonModel");

const createLesson = async (req, res) => {
  try {
    const { course_id, teacher_id, lesson_number, date, attendance_code } = req.body;

    const lesson = await lessonModel.createLesson(
      course_id,
      teacher_id,
      lesson_number,
      date,
      attendance_code
    );

    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
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