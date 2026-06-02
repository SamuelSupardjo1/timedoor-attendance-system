const pool = require("../config/db");

// Create a new class
const createClass = async (class_name, description = "") => {
  const result = await pool.query(
    `INSERT INTO classes (class_name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [class_name, description]
  );
  return result.rows[0];
};

// Get all classes with teacher info
const getClasses = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT 
      classes.id,
      classes.class_name,
      classes.description,
      classes.created_at,
      COUNT(DISTINCT class_students.student_id) AS student_count,
      COUNT(DISTINCT class_teachers.teacher_id) AS teacher_count,
      STRING_AGG(DISTINCT users.name, ', ') AS teacher_names
    FROM classes
    LEFT JOIN class_students ON classes.id = class_students.class_id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users ON teachers.user_id = users.id
    WHERE classes.class_name ILIKE $1
    GROUP BY classes.id
    ORDER BY classes.created_at DESC
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await pool.query(`
    SELECT COUNT(*) FROM classes
    WHERE class_name ILIKE $1
  `, [`%${search}%`]);

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

// Get single class by ID with full details
const getClassById = async (id) => {
  const result = await pool.query(`
    SELECT 
      classes.id,
      classes.class_name,
      classes.description,
      classes.created_at,
      COUNT(DISTINCT class_students.student_id) AS student_count,
      COUNT(DISTINCT class_teachers.teacher_id) AS teacher_count,
      STRING_AGG(DISTINCT users.name, ', ') AS teacher_names
    FROM classes
    LEFT JOIN class_students ON classes.id = class_students.class_id
    LEFT JOIN class_teachers ON classes.id = class_teachers.class_id
    LEFT JOIN teachers ON class_teachers.teacher_id = teachers.id
    LEFT JOIN users ON teachers.user_id = users.id
    WHERE classes.id = $1
    GROUP BY classes.id
  `, [id]);

  return result.rows[0];
};

// Update class
const updateClass = async (id, class_name, description) => {
  const result = await pool.query(
    `UPDATE classes SET class_name = $1, description = $2 WHERE id = $3 RETURNING *`,
    [class_name, description, id]
  );
  return result.rows[0];
};

// Delete class
const deleteClass = async (id) => {
  const result = await pool.query(
    `DELETE FROM classes WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// Add teacher to class
const addTeacherToClass = async (class_id, teacher_id) => {
  const result = await pool.query(
    `INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [class_id, teacher_id]
  );
  return result.rows[0];
};

// Remove teacher from class
const removeTeacherFromClass = async (class_id, teacher_id) => {
  const result = await pool.query(
    `DELETE FROM class_teachers WHERE class_id = $1 AND teacher_id = $2 RETURNING *`,
    [class_id, teacher_id]
  );
  return result.rows[0];
};

// Get students in a class
const getClassStudents = async (class_id) => {
  const result = await pool.query(`
    SELECT 
      students.id,
      students.user_id,
      users.name,
      users.email,
      users.role,
      STRING_AGG(DISTINCT lessons.lesson_name, ', ') AS lessons
    FROM class_students
    JOIN students ON class_students.student_id = students.id
    JOIN users ON students.user_id = users.id
    LEFT JOIN student_lessons ON students.id = student_lessons.student_id
    LEFT JOIN lessons ON student_lessons.lesson_id = lessons.id
    WHERE class_students.class_id = $1
    GROUP BY students.id, users.name, users.email, users.role
    ORDER BY users.name
  `, [class_id]);

  return result.rows;
};

const getClassTeachers = async (class_id) => {
  const result = await pool.query(`
    SELECT 
      teachers.id,
      teachers.user_id,
      users.name,
      users.email,
      users.role
    FROM class_teachers
    JOIN teachers ON class_teachers.teacher_id = teachers.id
    JOIN users ON teachers.user_id = users.id
    WHERE class_teachers.class_id = $1
    ORDER BY users.name
  `, [class_id]);

  return result.rows;
};

// Add student to class
const addStudentToClass = async (class_id, student_id) => {
  const result = await pool.query(
    `INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [class_id, student_id]
  );
  return result.rows[0];
};

// Remove student from class
const removeStudentFromClass = async (class_id, student_id) => {
  const result = await pool.query(
    `DELETE FROM class_students WHERE class_id = $1 AND student_id = $2 RETURNING *`,
    [class_id, student_id]
  );
  return result.rows[0];
};

// Assign lesson to student
const assignLessonToStudent = async (student_id, lesson_id) => {
  const result = await pool.query(
    `INSERT INTO student_lessons (student_id, lesson_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [student_id, lesson_id]
  );
  return result.rows[0];
};

// Remove lesson from student
const removeLessonFromStudent = async (student_id, lesson_id) => {
  const result = await pool.query(
    `DELETE FROM student_lessons WHERE student_id = $1 AND lesson_id = $2 RETURNING *`,
    [student_id, lesson_id]
  );
  return result.rows[0];
};

// Get student's lessons
const getStudentLessons = async (student_id) => {
  const result = await pool.query(`
    SELECT 
      lessons.id,
      lessons.lesson_name,
      lessons.lesson_number,
      courses.id AS course_id,
      courses.course_name,
      lessons.status
    FROM student_lessons
    JOIN lessons ON student_lessons.lesson_id = lessons.id
    JOIN courses ON lessons.course_id = courses.id
    WHERE student_lessons.student_id = $1
    ORDER BY courses.course_name, lessons.lesson_number
  `, [student_id]);

  return result.rows;
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addTeacherToClass,
  removeTeacherFromClass,
  getClassStudents,
  getClassTeachers,
  addStudentToClass,
  removeStudentFromClass,
  assignLessonToStudent,
  removeLessonFromStudent,
  getStudentLessons
};
