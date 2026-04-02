const pool = require("../config/db");

const createStudent = async (user_id, parent_id) => {
  const result = await pool.query(
    "INSERT INTO students (user_id, parent_id) VALUES ($1,$2) RETURNING *",
    [user_id, parent_id]
  );

  return result.rows[0];
};

const getStudents = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT students.id, students.user_id, students.parent_id, users.name, users.email, parents.name AS parent_name
    FROM students
    JOIN users ON students.user_id = users.id
    LEFT JOIN users AS parents ON students.parent_id = parents.id
    WHERE users.name ILIKE $1 OR users.email ILIKE $1
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM students
    JOIN users ON students.user_id = users.id
    WHERE users.name ILIKE $1 OR users.email ILIKE $1
  `, [`%${search}%`]);

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
  // first get the user_id
  const student = await pool.query(
    `SELECT user_id FROM students WHERE id = $1`,
    [id]
  );

  if (!student.rows[0]) return null;

  const user_id = student.rows[0].user_id;

  // delete related records first
  await pool.query(`DELETE FROM meeting_feedback WHERE student_id = $1`, [id]);
  await pool.query(`DELETE FROM attendance WHERE student_id = $1`, [id]);

  // then delete student
  await pool.query(`DELETE FROM students WHERE id = $1`, [id]);

  // then delete user
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [user_id]
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