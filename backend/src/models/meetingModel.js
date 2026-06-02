const pool = require("../config/db");

const createMeeting = async (class_id, date) => {
  // Generate 6-digit numeric code (matches student submission format)
  const attendance_code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

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

const startMeeting = async (meeting_id) => {
  const meetingRes = await pool.query(`SELECT class_id FROM meetings WHERE id = $1`, [meeting_id]);
  if (!meetingRes.rows[0]) return null;
  const class_id = meetingRes.rows[0].class_id;

  await pool.query(`
    INSERT INTO attendance (student_id, meeting_id, status)
    SELECT cs.student_id, $1, 'absent'
    FROM class_students cs
    WHERE cs.class_id = $2
    AND NOT EXISTS (
      SELECT 1 FROM attendance a 
      WHERE a.student_id = cs.student_id AND a.meeting_id = $1
    )
  `, [meeting_id, class_id]);
  
  return true;
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  startMeeting
};