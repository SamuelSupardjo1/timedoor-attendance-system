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

module.exports = {
  createStudent,
  getStudents
};