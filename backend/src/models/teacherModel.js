const pool = require("../config/db");

const createTeacher = async (user_id) => {
  const result = await pool.query(
    "INSERT INTO teachers (user_id) VALUES ($1) RETURNING *",
    [user_id]
  );

  return result.rows[0];
};

const getTeachers = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT teachers.id, teachers.user_id, users.name, users.email
    FROM teachers
    JOIN users ON teachers.user_id = users.id
    WHERE users.name ILIKE $1 OR users.email ILIKE $1
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM teachers
    JOIN users ON teachers.user_id = users.id
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
  const teacher = await pool.query(
    `SELECT user_id FROM teachers WHERE id = $1`, [id]
  );

  if (!teacher.rows[0]) return null;

  const user_id = teacher.rows[0].user_id;

  await pool.query(`DELETE FROM meeting_feedback WHERE teacher_id = $1`, [id]);
  await pool.query(`DELETE FROM meetings WHERE teacher_id = $1`, [id]);
  await pool.query(`DELETE FROM teachers WHERE id = $1`, [id]);

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`, [user_id]
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