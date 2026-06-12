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

const getMeetings = async (page = 1, limit = 10, search = "", teacherUserId = null) => {
  const offset = (page - 1) * limit;

  let query = `
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
    WHERE (classes.class_name ILIKE $1 OR meetings.attendance_code ILIKE $1)
  `;
  const params = [`%${search}%`, limit, offset];

  if (teacherUserId) {
    query += ` AND classes.id IN (
      SELECT ct.class_id
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      WHERE t.user_id = $4
    )`;
    params.push(teacherUserId);
  }

  query += `
    GROUP BY meetings.id, classes.class_name
    ORDER BY meetings.date DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, params);

  let totalQuery = `
    SELECT COUNT(DISTINCT meetings.id) FROM meetings
    JOIN classes ON meetings.class_id = classes.id
    WHERE (classes.class_name ILIKE $1 OR meetings.attendance_code ILIKE $1)
  `;
  const totalParams = [`%${search}%`];

  if (teacherUserId) {
    totalQuery += ` AND classes.id IN (
      SELECT ct.class_id
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      WHERE t.user_id = $2
    )`;
    totalParams.push(teacherUserId);
  }

  const total = await pool.query(totalQuery, totalParams);

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

const checkTeacherAccess = async (user_id, class_id) => {
  const result = await pool.query(`
    SELECT 1 
    FROM class_teachers ct
    JOIN teachers t ON ct.teacher_id = t.id
    WHERE t.user_id = $1 AND ct.class_id = $2
  `, [user_id, class_id]);
  return result.rows.length > 0;
};

const checkTeacherMeetingAccess = async (user_id, meeting_id) => {
  const result = await pool.query(`
    SELECT 1 
    FROM meetings m
    JOIN class_teachers ct ON m.class_id = ct.class_id
    JOIN teachers t ON ct.teacher_id = t.id
    WHERE t.user_id = $1 AND m.id = $2
  `, [user_id, meeting_id]);
  return result.rows.length > 0;
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  startMeeting,
  checkTeacherAccess,
  checkTeacherMeetingAccess
};