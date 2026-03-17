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

const getMeetings = async () => {
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
  `);

  return result.rows;
};

module.exports = {
  createMeeting,
  getMeetings,
};