const pool = require("../config/db");

const createMeeting = async (lesson_id, teacher_id, date) => {
  const attendance_code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const result = await pool.query(
    `INSERT INTO meetings (lesson_id, teacher_id, date, attendance_code)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [lesson_id, teacher_id, date, attendance_code]
  );

  return result.rows[0];
};

const getMeetings = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT 
      meetings.*,
      lessons.lesson_name,
      lessons.lesson_number,
      users.name AS teacher_name
    FROM meetings
    JOIN lessons ON meetings.lesson_id = lessons.id
    JOIN teachers ON meetings.teacher_id = teachers.id
    JOIN users ON teachers.user_id = users.id
    WHERE lessons.lesson_name ILIKE $1 OR users.name ILIKE $1
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM meetings
    JOIN lessons ON meetings.lesson_id = lessons.id
    JOIN teachers ON meetings.teacher_id = teachers.id
    JOIN users ON teachers.user_id = users.id
    WHERE lessons.lesson_name ILIKE $1 OR users.name ILIKE $1
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

const getMeetingById = async (id) => {
  const result = await pool.query(`
    SELECT 
      meetings.*,
      lessons.lesson_name,
      lessons.lesson_number,
      users.name AS teacher_name
    FROM meetings
    JOIN lessons ON meetings.lesson_id = lessons.id
    JOIN teachers ON meetings.teacher_id = teachers.id
    JOIN users ON teachers.user_id = users.id
    WHERE meetings.id = $1
  `, [id]);

  return result.rows[0];
};

const updateMeeting = async (id, lesson_id, teacher_id, date) => {
  const result = await pool.query(
    `UPDATE meetings
     SET lesson_id = $1, teacher_id = $2, date = $3
     WHERE id = $4
     RETURNING *`,
    [lesson_id, teacher_id, date, id]
  );

  return result.rows[0];
};

const deleteMeeting = async (id) => {
  const result = await pool.query(
    `DELETE FROM meetings WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
};