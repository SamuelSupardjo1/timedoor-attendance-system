const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "attendance_system",
  password: "admin",
  port: 5432,
});

async function seedDatabase() {
  try {
    await client.connect();

    console.log("🌱 Seeding database...");

    // USERS
    const teacherUser = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Mr John', 'john@school.com', '123', 'teacher')
      RETURNING id
    `);

    const studentUser = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Alice', 'alice@student.com', '123', 'student')
      RETURNING id
    `);

    const parentUser = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Mrs Alice Mom', 'mom@student.com', '123', 'parent')
      RETURNING id
    `);

    // TEACHER
    const teacher = await client.query(`
      INSERT INTO teachers (user_id)
      VALUES (${teacherUser.rows[0].id})
      RETURNING id
    `);

    // STUDENT
    const student = await client.query(`
      INSERT INTO students (user_id, parent_id)
      VALUES (${studentUser.rows[0].id}, ${parentUser.rows[0].id})
      RETURNING id
    `);

    // COURSE
    const course = await client.query(`
      INSERT INTO courses (course_name, description)
      VALUES ('Game Dev Kids', 'Basic game development course')
      RETURNING id
    `);

    // LESSON
    const lesson = await client.query(`
      INSERT INTO lessons (course_id, lesson_number, lesson_name)
      VALUES (${course.rows[0].id}, 1, 'Intro to Game Dev')
      RETURNING id
    `);

    // MEETING (session of lesson)
    const meeting = await client.query(`
      INSERT INTO meetings (lesson_id, teacher_id, date, attendance_code)
      VALUES (${lesson.rows[0].id}, ${teacher.rows[0].id}, NOW(), 'ABC123')
      RETURNING id
    `);

    // ATTENDANCE
    await client.query(`
      INSERT INTO attendance (student_id, meeting_id, status)
      VALUES (${student.rows[0].id}, ${meeting.rows[0].id}, 'present')
    `);

    // FEEDBACK
    await client.query(`
      INSERT INTO meeting_feedback (meeting_id, student_id, teacher_id, feedback, media_url)
      VALUES (
        ${meeting.rows[0].id},
        ${student.rows[0].id},
        ${teacher.rows[0].id},
        'Good progress, student understands basic concept',
        'https://example.com/video.mp4'
      )
    `);

    console.log("✅ Seeding completed successfully!");

    await client.end();
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}

seedDatabase();