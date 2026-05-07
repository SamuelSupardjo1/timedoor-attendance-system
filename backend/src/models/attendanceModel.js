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

// Get active meetings for a student
const getStudentActiveMeetings = async (student_id) => {
  const result = await pool.query(`
    SELECT DISTINCT
      m.id as meeting_id,
      m.attendance_code,
      m.date,
      c.id as class_id,
      c.class_name,
      c.description as lesson_name,
      NULL as lesson_number,
      c.class_name as course_name,
      STRING_AGG(DISTINCT u.name, ', ') as teacher_name,
      COALESCE(a.id, NULL) as attendance_id,
      COALESCE(a.code_submitted, NULL) as code_submitted,
      COALESCE(a.approval_status, 'pending') as approval_status
    FROM meetings m
    JOIN classes c ON m.class_id = c.id
    JOIN class_students cs ON c.id = cs.class_id
    LEFT JOIN class_teachers ct ON c.id = ct.class_id
    LEFT JOIN teachers t ON ct.teacher_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN attendance a ON a.student_id = $1 AND a.meeting_id = m.id
    WHERE cs.student_id = $1 
      AND m.date >= NOW()::date - INTERVAL '7 days'
      AND m.date <= NOW()::date + INTERVAL '7 days'
    GROUP BY m.id, c.id, a.id
    ORDER BY m.date DESC
  `, [student_id]);
  return result.rows;
};

// Submit attendance code
const submitAttendanceCode = async (student_id, meeting_id, code) => {
  // First try to update existing attendance record
  let result = await pool.query(`
    UPDATE attendance 
    SET code_submitted = $1, submitted_at = NOW(), approval_status = 'pending'
    WHERE student_id = $2 AND meeting_id = $3
    RETURNING *
  `, [code, student_id, meeting_id]);
  
  // If no record exists, create one
  if (!result.rows[0]) {
    result = await pool.query(`
      INSERT INTO attendance (student_id, meeting_id, code_submitted, submitted_at, approval_status, status)
      VALUES ($1, $2, $3, NOW(), 'pending', 'pending')
      RETURNING *
    `, [student_id, meeting_id, code]);
  }
  
  return result.rows[0];
};

// Get pending attendance for teacher approval
const getPendingAttendance = async (teacher_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const result = await pool.query(`
    SELECT 
      a.id,
      a.student_id,
      a.meeting_id,
      a.code_submitted,
      a.approval_status,
      a.submitted_at,
      u.name as student_name,
      u.email as student_email,
      m.attendance_code,
      m.date,
      c.class_name,
      l.lesson_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN meetings m ON a.meeting_id = m.id
    JOIN classes c ON m.class_id = c.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN class_teachers ct ON c.id = ct.class_id
    WHERE ct.teacher_id = $1 AND a.approval_status = 'pending' AND a.code_submitted IS NOT NULL
    ORDER BY a.submitted_at DESC
    LIMIT $2 OFFSET $3
  `, [teacher_id, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN meetings m ON a.meeting_id = m.id
    JOIN classes c ON m.class_id = c.id
    JOIN class_teachers ct ON c.id = ct.class_id
    WHERE ct.teacher_id = $1 AND a.approval_status = 'pending' AND a.code_submitted IS NOT NULL
  `, [teacher_id]);

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

// Approve attendance
const approveAttendance = async (attendance_id, approved) => {
  const status = approved ? 'approved' : 'rejected';
  const result = await pool.query(`
    UPDATE attendance 
    SET approval_status = $1, approved_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [status, attendance_id]);
  return result.rows[0];
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getStudentActiveMeetings,
  submitAttendanceCode,
  getPendingAttendance,
  approveAttendance
};