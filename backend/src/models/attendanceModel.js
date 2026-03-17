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

module.exports = {
  markAttendance,
  getAttendance
};