const pool = require("../config/db");

const createTeacher = async (user_id) => {
  const result = await pool.query(
    "INSERT INTO teachers (user_id) VALUES ($1) RETURNING *",
    [user_id]
  );

  return result.rows[0];
};

const getTeachers = async () => {
  const result = await pool.query(`
    SELECT teachers.*, users.name, users.email
    FROM teachers
    JOIN users ON teachers.user_id = users.id
  `);

  return result.rows;
};

module.exports = {
  createTeacher,
  getTeachers
};