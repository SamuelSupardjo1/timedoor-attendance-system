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

const getFeedbacks = async (page = 1, limit = 10, search = "", meeting_id = null, student_id = null, parent_id = null) => {
  const offset = (page - 1) * limit;

  // Build WHERE clause - students see only their own, parents see their children's
  let whereConditions = [];
  let params = [];
  let paramIndex = 1;

  if (student_id) {
    whereConditions.push(`meeting_feedback.student_id = $${paramIndex}`);
    params.push(student_id);
    paramIndex++;
  }

  if (parent_id) {
    whereConditions.push(`students.parent_id = $${paramIndex}`);
    params.push(parent_id);
    paramIndex++;
  }

  if (meeting_id) {
    whereConditions.push(`meeting_feedback.meeting_id = $${paramIndex}`);
    params.push(meeting_id);
    paramIndex++;
  }

  if (search) {
    whereConditions.push(`meeting_feedback.feedback ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  params.push(limit);
  params.push(offset);

  const result = await pool.query(`
    SELECT meeting_feedback.*
    FROM meeting_feedback
    JOIN meetings ON meeting_feedback.meeting_id = meetings.id
    JOIN students ON meeting_feedback.student_id = students.id
    JOIN teachers ON meeting_feedback.teacher_id = teachers.id
    ${whereClause}
    ORDER BY meeting_feedback.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, params);

  const totalParams = params.slice(0, params.length - 2);
  const countResult = await pool.query(`
    SELECT COUNT(*) FROM meeting_feedback
    JOIN meetings ON meeting_feedback.meeting_id = meetings.id
    JOIN students ON meeting_feedback.student_id = students.id
    ${whereClause}
  `, totalParams);

  return {
    data: result.rows,
    meta: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    }
  };
};

const getFeedbackById = async (id, student_id = null, parent_id = null) => {
  let query = `
    SELECT meeting_feedback.*, meetings.date, students.user_id AS student_user_id, teachers.user_id AS teacher_user_id, students.parent_id
    FROM meeting_feedback
    JOIN meetings ON meeting_feedback.meeting_id = meetings.id
    JOIN students ON meeting_feedback.student_id = students.id
    JOIN teachers ON meeting_feedback.teacher_id = teachers.id
    WHERE meeting_feedback.id = $1
  `;
  let params = [id];

  // If student_id provided, ensure they can only see their own feedback
  if (student_id) {
    query += ` AND meeting_feedback.student_id = $2`;
    params.push(student_id);
  }
  // If parent_id provided, ensure they can only see their children's feedback
  else if (parent_id) {
    query += ` AND students.parent_id = $2`;
    params.push(parent_id);
  }

  const result = await pool.query(query, params);
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