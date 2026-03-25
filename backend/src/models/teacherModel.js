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

const getTeacherById = async (id) => {
  const result = await pool.query(
    `SELECT teachers.*, users.name, users.email
     FROM teachers
     JOIN users ON teachers.user_id = users.id
     WHERE teachers.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateTeacher = async (id, user_id) => {
  const result = await pool.query(
    `UPDATE teachers SET user_id = $1 WHERE id = $2 RETURNING *`,
    [user_id, id]
  );
  return result.rows[0];
};

const deleteTeacher = async (id) => {
  const result = await pool.query(
    `DELETE FROM teachers WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};