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

module.exports = {
  createCourse,
  getCourses
};