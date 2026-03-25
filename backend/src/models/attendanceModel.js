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

const getAttendance = async () => {
  const result = await pool.query(`
    SELECT attendance.*, students.id AS student
    FROM attendance
    JOIN students ON attendance.student_id = students.id
  `);

  return result.rows;
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