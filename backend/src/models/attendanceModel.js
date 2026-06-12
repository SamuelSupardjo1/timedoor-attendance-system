const pool = require("../config/db");

const validateStudentCourse = async (student_id, lesson_id) => {
  // Ambil course_id dari pelajaran yang sudah ditugaskan ke murid
  const studentCourseRes = await pool.query(`
    SELECT DISTINCT l.course_id, c.course_name
    FROM student_lessons sl
    JOIN lessons l ON sl.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    WHERE sl.student_id = $1
  `, [student_id]);

  if (studentCourseRes.rows.length > 0) {
    const enrolledCourseId = studentCourseRes.rows[0].course_id;
    const enrolledCourseName = studentCourseRes.rows[0].course_name;

    // Ambil course_id dari lesson_id yang akan diajukan absensinya
    const targetLessonRes = await pool.query(`
      SELECT course_id FROM lessons WHERE id = $1
    `, [lesson_id]);

    if (targetLessonRes.rows[0] && targetLessonRes.rows[0].course_id !== enrolledCourseId) {
      const error = new Error(`Student is already enrolled in course "${enrolledCourseName}". Students can only take one course at a time.`);
      error.status = 400;
      throw error;
    }
  }
};

const markAttendance = async (student_id, meeting_id, lesson_id, status) => {
  if (lesson_id) {
    await validateStudentCourse(student_id, lesson_id);
  }

  const result = await pool.query(
    `INSERT INTO attendance (student_id, meeting_id, lesson_id, status, created_at)
     VALUES ($1,$2,$3,$4,NOW())
     RETURNING *`,
    [student_id, meeting_id, lesson_id, status]
  );

  return result.rows[0];
};

const getAttendance = async (page = 1, limit = 10, search = "", meeting_id = null, parent_id = null, teacher_user_id = null) => {
  const offset = (page - 1) * limit;
  
  let params = [];
  let paramIndex = 1;
  let whereConditions = [];

  if (search) {
    whereConditions.push(`(users.name ILIKE $${paramIndex} OR attendance.status ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (meeting_id) {
    whereConditions.push(`attendance.meeting_id = $${paramIndex}`);
    params.push(meeting_id);
    paramIndex++;
  }

  if (parent_id) {
    whereConditions.push(`students.parent_id = $${paramIndex}`);
    params.push(parent_id);
    paramIndex++;
  }

  if (teacher_user_id) {
    whereConditions.push(`meetings.class_id IN (
      SELECT ct.class_id
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      WHERE t.user_id = $${paramIndex}
    )`);
    params.push(teacher_user_id);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  params.push(limit);
  params.push(offset);

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
      teacher_users.name AS teacher_name,
      (SELECT DISTINCT co2.course_name FROM student_lessons sl2 JOIN lessons l2 ON sl2.lesson_id = l2.id JOIN courses co2 ON l2.course_id = co2.id WHERE sl2.student_id = students.id LIMIT 1) AS student_course_name,
      (SELECT DISTINCT co2.id FROM student_lessons sl2 JOIN lessons l2 ON sl2.lesson_id = l2.id JOIN courses co2 ON l2.course_id = co2.id WHERE sl2.student_id = students.id LIMIT 1) AS student_course_id
    FROM attendance
    JOIN students ON attendance.student_id = students.id
    JOIN users ON students.user_id = users.id
    LEFT JOIN lessons ON attendance.lesson_id = lessons.id
    LEFT JOIN courses ON lessons.course_id = courses.id
    JOIN meetings ON attendance.meeting_id = meetings.id
    JOIN classes ON meetings.class_id = classes.id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users AS teacher_users ON teachers.user_id = teacher_users.id
    ${whereClause}
    ORDER BY attendance.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, params);

  const countParams = params.slice(0, params.length - 2);
  const total = await pool.query(`
    SELECT COUNT(DISTINCT attendance.id) FROM attendance
    JOIN students ON attendance.student_id = students.id
    JOIN users ON students.user_id = users.id
    LEFT JOIN lessons ON attendance.lesson_id = lessons.id
    LEFT JOIN courses ON lessons.course_id = courses.id
    JOIN meetings ON attendance.meeting_id = meetings.id
    JOIN classes ON meetings.class_id = classes.id
    ${whereClause}
  `, countParams);

  return {
    data: result.rows,
    meta: {
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(total.rows[0].count) / limit)
    }
  };
};

const getAttendanceById = async (id, parent_id = null, teacher_user_id = null) => {
  let query = `
    SELECT attendance.*, students.user_id, meetings.date, meetings.attendance_code, 
            lessons.lesson_name, lessons.lesson_number, lessons.status AS lesson_status, courses.course_name, classes.class_name,
            teacher_users.name AS teacher_name,
            (SELECT DISTINCT co2.course_name FROM student_lessons sl2 JOIN lessons l2 ON sl2.lesson_id = l2.id JOIN courses co2 ON l2.course_id = co2.id WHERE sl2.student_id = students.id LIMIT 1) AS student_course_name,
            (SELECT DISTINCT co2.id FROM student_lessons sl2 JOIN lessons l2 ON sl2.lesson_id = l2.id JOIN courses co2 ON l2.course_id = co2.id WHERE sl2.student_id = students.id LIMIT 1) AS student_course_id
     FROM attendance
     JOIN students ON attendance.student_id = students.id
     JOIN meetings ON attendance.meeting_id = meetings.id
     LEFT JOIN lessons ON attendance.lesson_id = lessons.id
     LEFT JOIN courses ON lessons.course_id = courses.id
     JOIN classes ON meetings.class_id = classes.id
     LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
     LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
     LEFT JOIN users AS teacher_users ON teachers.user_id = teacher_users.id
     WHERE attendance.id = $1
  `;
  let params = [id];
  let paramIndex = 2;

  if (parent_id) {
    query += ` AND students.parent_id = $${paramIndex}`;
    params.push(parent_id);
    paramIndex++;
  }

  if (teacher_user_id) {
    query += ` AND meetings.class_id IN (
      SELECT ct.class_id
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      WHERE t.user_id = $${paramIndex}
    )`;
    params.push(teacher_user_id);
    paramIndex++;
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

const updateAttendance = async (id, status, lesson_id = undefined) => {
  if (lesson_id !== undefined) {
    const attRes = await pool.query("SELECT student_id FROM attendance WHERE id = $1", [id]);
    if (attRes.rows[0]) {
      await validateStudentCourse(attRes.rows[0].student_id, lesson_id);
    }
  }

  let query = "UPDATE attendance SET";
  let params = [];
  let index = 1;

  if (status !== undefined) {
    query += ` status = $${index},`;
    params.push(status);
    index++;
  }

  if (lesson_id !== undefined) {
    query += ` lesson_id = $${index},`;
    params.push(lesson_id);
    index++;
  }

  // Nothing to update
  if (params.length === 0) return null;

  // Remove trailing comma
  query = query.slice(0, -1);

  query += ` WHERE id = $${index} RETURNING *`;
  params.push(id);

  const result = await pool.query(query, params);
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
      COALESCE(l.lesson_name, c.description) as lesson_name,
      l.lesson_number as lesson_number,
      COALESCE(co.course_name, c.class_name) as course_name,
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
    LEFT JOIN lessons l ON a.lesson_id = l.id
    LEFT JOIN courses co ON l.course_id = co.id
    WHERE cs.student_id = $1 
      AND m.date >= NOW()::date - INTERVAL '7 days'
      AND m.date <= NOW()::date + INTERVAL '7 days'
    GROUP BY m.id, c.id, a.id, l.id, co.id
    ORDER BY m.date DESC
  `, [student_id]);
  return result.rows;
};

// Submit attendance code
const submitAttendanceCode = async (student_id, meeting_id, code) => {
  // First try to update existing attendance record
  let result = await pool.query(`
    UPDATE attendance 
    SET code_submitted = $1, submitted_at = NOW(), approval_status = 'pending', status = 'present'
    WHERE student_id = $2 AND meeting_id = $3
    RETURNING *
  `, [code, student_id, meeting_id]);
  
  // If no record exists, create one
  if (!result.rows[0]) {
    result = await pool.query(`
      INSERT INTO attendance (student_id, meeting_id, code_submitted, submitted_at, approval_status, status)
      VALUES ($1, $2, $3, NOW(), 'pending', 'present')
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
    LEFT JOIN lessons l ON a.lesson_id = l.id
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

// Resubmit attendance code (for rejected submissions)
const resubmitAttendanceCode = async (student_id, meeting_id, code) => {
  // Update existing rejected attendance record to allow resubmission
  const result = await pool.query(`
    UPDATE attendance 
    SET code_submitted = $1, submitted_at = NOW(), approval_status = 'pending', status = 'present'
    WHERE student_id = $2 AND meeting_id = $3 AND approval_status = 'rejected'
    RETURNING *
  `, [code, student_id, meeting_id]);
  
  return result.rows[0] || null;
};

const checkTeacherAttendanceAccess = async (user_id, attendance_id) => {
  const result = await pool.query(`
    SELECT 1 
    FROM attendance a
    JOIN meetings m ON a.meeting_id = m.id
    JOIN class_teachers ct ON m.class_id = ct.class_id
    JOIN teachers t ON ct.teacher_id = t.id
    WHERE t.user_id = $1 AND a.id = $2
  `, [user_id, attendance_id]);
  return result.rows.length > 0;
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
  approveAttendance,
  resubmitAttendanceCode,
  checkTeacherAttendanceAccess
};