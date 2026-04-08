const pool = require("../config/db");

const createMeeting = async (class_id, date) => {
  const attendance_code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const result = await pool.query(
    `INSERT INTO meetings (class_id, date, attendance_code)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [class_id, date, attendance_code]
  );

  return result.rows[0];
};

const getMeetings = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT 
      meetings.*,
      classes.class_name,
      COUNT(DISTINCT attendance.student_id) AS student_count,
      STRING_AGG(DISTINCT users.name, ', ') AS teacher_names
    FROM meetings
    JOIN classes ON meetings.class_id = classes.id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users ON teachers.user_id = users.id
    LEFT JOIN attendance ON meetings.id = attendance.meeting_id
    WHERE classes.class_name ILIKE $1 OR meetings.attendance_code ILIKE $1
    GROUP BY meetings.id, classes.class_name
    ORDER BY meetings.date DESC
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(DISTINCT meetings.id) FROM meetings
    JOIN classes ON meetings.class_id = classes.id
    WHERE classes.class_name ILIKE $1 OR meetings.attendance_code ILIKE $1
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
      classes.class_name,
      COUNT(DISTINCT attendance.student_id) AS student_count,
      STRING_AGG(DISTINCT users.name, ', ') AS teacher_names
    FROM meetings
    JOIN classes ON meetings.class_id = classes.id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users ON teachers.user_id = users.id
    LEFT JOIN attendance ON meetings.id = attendance.meeting_id
    WHERE meetings.id = $1
    GROUP BY meetings.id, classes.class_name
  `, [id]);

  return result.rows[0];
};

const updateMeeting = async (id, class_id, date) => {
  const result = await pool.query(
    `UPDATE meetings
     SET class_id = $1, date = $2
     WHERE id = $3
     RETURNING *`,
    [class_id, date, id]
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