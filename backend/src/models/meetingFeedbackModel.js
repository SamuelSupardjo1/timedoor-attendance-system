const pool = require("../config/db");

const createFeedback = async (meeting_id , student_id, teacher_id, feedback, media_url) => {
  const result = await pool.query(
    `INSERT INTO meeting_feedback (meeting_id , student_id, teacher_id, feedback, media_url)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [meeting_id , student_id, teacher_id, feedback, media_url]
  );

  return result.rows[0];
};

const getFeedback = async () => {
  const result = await pool.query("SELECT * FROM meeting_feedback");
  return result.rows;
};

module.exports = {
  createFeedback,
  getFeedback
};