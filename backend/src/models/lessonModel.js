const pool = require("../config/db");

const createLesson = async (course_id, lesson_number, lesson_name) => {
  const result = await pool.query(
    `INSERT INTO lessons (course_id, lesson_number, lesson_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [course_id, lesson_number, lesson_name]
  );

  return result.rows[0];
};

const getLessons = async (page = 1, limit = 10, search = "", course_id = null, student_id = null) => {
  const offset = (page - 1) * limit;
  let params = [];
  let paramIndex = 1;
  let whereConditions = [];

  // Build WHERE clause with parameterized queries
  if (course_id) {
    whereConditions.push(`lessons.course_id = $${paramIndex}`);
    params.push(course_id);
    paramIndex++;
  }

  if (search) {
    whereConditions.push(`lessons.lesson_name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // If student_id provided, only show lessons from courses in their enrolled classes
  let joinClause = '';
  if (student_id) {
    joinClause = `
      JOIN classes ON courses.id = classes.course_id
      JOIN class_students ON classes.id = class_students.class_id
    `;
    whereConditions.push(`class_students.student_id = $${paramIndex}`);
    params.push(student_id);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  params.push(limit);
  params.push(offset);

  const result = await pool.query(`
    SELECT DISTINCT lessons.*, courses.course_name
    FROM lessons
    JOIN courses ON lessons.course_id = courses.id
    ${joinClause}
    ${whereClause}
    ORDER BY lessons.lesson_number ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, params);

  // Count query for pagination
  const countParams = params.slice(0, params.length - 2);
  const total = await pool.query(`
    SELECT COUNT(DISTINCT lessons.id) as count FROM lessons
    JOIN courses ON lessons.course_id = courses.id
    ${joinClause}
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

const getLessonById = async (id, student_id = null) => {
  let query = `
    SELECT lessons.*, courses.course_name
    FROM lessons
    JOIN courses ON lessons.course_id = courses.id
    WHERE lessons.id = $1
  `;
  let params = [id];

  // If student_id provided, ensure they can only see lessons from their enrolled courses
  if (student_id) {
    query += `
      AND EXISTS (
        SELECT 1 FROM classes
        JOIN class_students ON classes.id = class_students.class_id
        WHERE classes.course_id = courses.id
        AND class_students.student_id = $2
      )
    `;
    params.push(student_id);
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

const updateLesson = async (id, course_id, lesson_number, lesson_name) => {
  const result = await pool.query(
    `UPDATE lessons SET course_id = $1, lesson_number = $2, lesson_name = $3 WHERE id = $4 RETURNING *`,
    [course_id, lesson_number, lesson_name, id]
  );
  return result.rows[0];
};

const deleteLesson = async (id) => {
  const result = await pool.query(
    `DELETE FROM lessons WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson 
};