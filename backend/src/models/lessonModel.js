const pool = require("../config/db");

const createLesson = async (course_id, lesson_number, lesson_name) => {
  const result = await pool.query(
    `INSERT INTO lessons (course_id, lesson_number, lesson_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [course_id, lesson_number, lesson_name]
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