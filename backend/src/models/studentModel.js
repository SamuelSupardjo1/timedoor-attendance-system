const pool = require("../config/db");

const createStudent = async (user_id, parent_id) => {
  const result = await pool.query(
    "INSERT INTO students (user_id, parent_id) VALUES ($1,$2) RETURNING *",
    [user_id, parent_id]
  );

  return result.rows[0];
};

const getStudents = async () => {
  const result = await pool.query(`
    SELECT students.id, students.user_id, students.parent_id, users.name, users.email, parents.name AS parent_name
    FROM students
    JOIN users ON students.user_id = users.id
    LEFT JOIN users AS parents ON students.parent_id = parents.id
  `);

  return result.rows;
};

const getStudentById = async (id) => {
  const result = await pool.query(
    `SELECT students.*, users.name, users.email, parents.name AS parent_name
     FROM students
     JOIN users ON students.user_id = users.id
     LEFT JOIN users AS parents ON students.parent_id = parents.id
     WHERE students.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateStudent = async (id, user_id, parent_id) => {
  const result = await pool.query(
    `UPDATE students SET user_id = $1, parent_id = $2 WHERE id = $3 RETURNING *`,
    [user_id, parent_id, id]
  );
  return result.rows[0];
};

const deleteStudent = async (id) => {
  const result = await pool.query(
    `DELETE FROM students WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};