const pool = require("../config/db");

const markAttendance = async (student_id, meeting_id , lesson_id, status) => {
  const result = await pool.query(
    `INSERT INTO attendance (student_id, meeting_id, lesson_id, status, created_at)
     VALUES ($1,$2,$3,$4,NOW())
     RETURNING *`,
    [student_id, meeting_id, lesson_id, status]
  );

  return result.rows[0];
};

const getAttendance = async (page = 1, limit = 10, search = "", meeting_id = null) => {
  const offset = (page - 1) * limit;

  const whereClause = meeting_id
    ? `WHERE attendance.meeting_id = ${meeting_id} AND (users.name ILIKE '%${search}%' OR attendance.status ILIKE '%${search}%')`
    : `WHERE (users.name ILIKE '%${search}%' OR attendance.status ILIKE '%${search}%')`;

  const result = await pool.query(`
    SELECT 
      attendance.*,
      students.id AS student_id,
      users.name AS student_name,
      users.email AS student_email,
      lessons.lesson_name,
      lessons.lesson_number,
      lessons.status AS lesson_status,
      courses.course_name,
      classes.class_name,
      teacher_users.name AS teacher_name
    FROM attendance
    JOIN students ON attendance.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN lessons ON attendance.lesson_id = lessons.id
    JOIN courses ON lessons.course_id = courses.id
    JOIN meetings ON attendance.meeting_id = meetings.id
    JOIN classes ON meetings.class_id = classes.id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users AS teacher_users ON teachers.user_id = teacher_users.id
    ${whereClause}
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(DISTINCT attendance.id) FROM attendance
    JOIN students ON attendance.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN lessons ON attendance.lesson_id = lessons.id
    JOIN courses ON lessons.course_id = courses.id
    JOIN meetings ON attendance.meeting_id = meetings.id
    JOIN classes ON meetings.class_id = classes.id
    ${whereClause}
  `);

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

const getAttendanceById = async (id) => {
  const result = await pool.query(
    `SELECT attendance.*, students.user_id, meetings.date, meetings.attendance_code, 
            lessons.lesson_name, lessons.lesson_number, lessons.status AS lesson_status, courses.course_name, classes.class_name,
            teacher_users.name AS teacher_name
     FROM attendance
     JOIN students ON attendance.student_id = students.id
     JOIN meetings ON attendance.meeting_id = meetings.id
     JOIN lessons ON attendance.lesson_id = lessons.id
     JOIN courses ON lessons.course_id = courses.id
     JOIN classes ON meetings.class_id = classes.id
     LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
     LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
     LEFT JOIN users AS teacher_users ON teachers.user_id = teacher_users.id
     WHERE attendance.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateAttendance = async (id, status) => {
  const result = await pool.query(
    `UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

const deleteAttendance = async (id) => {
  const result = await pool.query(
    `DELETE FROM attendance WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
};