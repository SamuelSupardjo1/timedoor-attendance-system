const pool = require("../config/db");

const createCourse = async (course_name, description) => {
  const result = await pool.query(
    "INSERT INTO courses (course_name, description) VALUES ($1,$2) RETURNING *",
    [course_name, description]
  );

  return result.rows[0];
};

const getCourses = async () => {
  const result = await pool.query(
    "SELECT * FROM courses"
  );

  return result.rows;
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