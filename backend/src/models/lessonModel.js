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

const getLessons = async (page = 1, limit = 10, search = "", course_id = null) => {
  const offset = (page - 1) * limit;

  const whereClause = course_id
    ? `WHERE lessons.course_id = ${course_id} AND lessons.lesson_name ILIKE '%${search}%'`
    : `WHERE lessons.lesson_name ILIKE '%${search}%'`;

  const result = await pool.query(`
    SELECT lessons.*, courses.course_name
    FROM lessons
    JOIN courses ON lessons.course_id = courses.id
    ${whereClause}
    ORDER BY lessons.lesson_number ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM lessons
    ${whereClause}
  `);

  return {
    data: result.rows,
    meta: {
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total.rows[0].count / limit)
    }
  };
};

const getLessonById = async (id) => {
  const result = await pool.query(
    `SELECT lessons.*, courses.course_name
     FROM lessons
     JOIN courses ON lessons.course_id = courses.id
     WHERE lessons.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateLesson = async (id, course_id, lesson_number, lesson_name) => {
  const result = await pool.query(
    `UPDATE lessons SET course_id = $1, lesson_number = $2, lesson_name = $3 WHERE id = $4 RETURNING *`,
    [course_id, lesson_number, lesson_name, id]
  );
  return result.rows[0];
};

const deleteLesson = async (id) => {
  const result = await pool.query(
    `DELETE FROM lessons WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson 
};