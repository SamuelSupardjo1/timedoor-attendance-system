const pool = require("../config/db");

const createCourse = async (course_name, description) => {
  const result = await pool.query(
    "INSERT INTO courses (course_name, description) VALUES ($1,$2) RETURNING *",
    [course_name, description]
  );

  return result.rows[0];
};

const getCourses = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT * FROM courses LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = await pool.query(`SELECT COUNT(*) FROM courses`);
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

const getCourseById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM courses WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateCourse = async (id, course_name, description) => {
  const result = await pool.query(
    `UPDATE courses SET course_name = $1, description = $2 WHERE id = $3 RETURNING *`,
    [course_name, description, id]
  );
  return result.rows[0];
};

const deleteCourse = async (id) => {
  const result = await pool.query(
    `DELETE FROM courses WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};