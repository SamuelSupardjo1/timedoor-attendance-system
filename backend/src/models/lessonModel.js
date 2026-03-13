const pool = require("../config/db");

const createLesson = async (course_id, teacher_id, lesson_number, date, attendance_code) => {
  const result = await pool.query(
    `INSERT INTO lessons (course_id, teacher_id, lesson_number, date, attendance_code)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [course_id, teacher_id, lesson_number, date, attendance_code]
  );

  return result.rows[0];
};

const getLessons = async () => {
  const result = await pool.query(`
    SELECT lessons.*, courses.course_name
    FROM lessons
    JOIN courses ON lessons.course_id = courses.id
  `);

  return result.rows;
};

module.exports = {
  createLesson,
  getLessons
};