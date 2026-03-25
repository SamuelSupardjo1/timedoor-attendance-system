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

const getFeedbacks = async () => {
  const result = await pool.query("SELECT * FROM meeting_feedback");
  return result.rows;
};

const getFeedbackById = async (id) => {
  const result = await pool.query(
    `SELECT meeting_feedback.*, meetings.date, students.user_id AS student_user_id, teachers.user_id AS teacher_user_id
     FROM meeting_feedback
     JOIN meetings ON meeting_feedback.meeting_id = meetings.id
     JOIN students ON meeting_feedback.student_id = students.id
     JOIN teachers ON meeting_feedback.teacher_id = teachers.id
     WHERE meeting_feedback.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateFeedback = async (id, feedback, media_url) => {
  const result = await pool.query(
    `UPDATE meeting_feedback SET feedback = $1, media_url = $2 WHERE id = $3 RETURNING *`,
    [feedback, media_url, id]
  );
  return result.rows[0];
};

const deleteFeedback = async (id) => {
  const result = await pool.query(
    `DELETE FROM meeting_feedback WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
};