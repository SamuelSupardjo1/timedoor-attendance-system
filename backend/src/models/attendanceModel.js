const pool = require("../config/db");

const markAttendance = async (student_id, meeting_id , status) => {
  const result = await pool.query(
    `INSERT INTO attendance (student_id, meeting_id , status, created_at)
     VALUES ($1,$2,$3,NOW())
     RETURNING *`,
    [student_id, meeting_id , status]
  );

  return result.rows[0];
};

const getAttendance = async (page = 1, limit = 10, search = "", meeting_id = null) => {
  const offset = (page - 1) * limit;

  const whereClause = meeting_id
    ? `WHERE attendance.meeting_id = ${meeting_id} AND attendance.status ILIKE '%${search}%'`
    : `WHERE attendance.status ILIKE '%${search}%'`;

  const result = await pool.query(`
    SELECT attendance.*, students.id AS student
    FROM attendance
    JOIN students ON attendance.student_id = students.id
    ${whereClause}
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM attendance
    JOIN students ON attendance.student_id = students.id
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
    `SELECT attendance.*, students.user_id, meetings.date, meetings.attendance_code
     FROM attendance
     JOIN students ON attendance.student_id = students.id
     JOIN meetings ON attendance.meeting_id = meetings.id
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