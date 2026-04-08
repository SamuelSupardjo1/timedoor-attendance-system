const { Client } = require("pg");
const bcrypt = require("bcrypt");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "attendance_system",
  password: "admin",
  port: 5432,
});

// Utility function to generate random code
const generateAttendanceCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

async function seedDatabase() {
  try {
    await client.connect();

    console.log("🌱 Seeding database...");

    // Clear existing data
    await client.query("DELETE FROM meeting_feedback");
    await client.query("DELETE FROM attendance");
    await client.query("DELETE FROM student_lessons");
    await client.query("DELETE FROM class_students");
    await client.query("DELETE FROM class_teachers");
    await client.query("DELETE FROM meetings");
    await client.query("DELETE FROM classes");
    await client.query("DELETE FROM lessons");
    await client.query("DELETE FROM courses");
    await client.query("DELETE FROM students");
    await client.query("DELETE FROM teachers");
    await client.query("DELETE FROM users");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // ===== SEED USERS =====
    console.log("📝 Creating users...");

    // Admin User
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@school.com', $1, 'admin')
      RETURNING id
    `, [hashedPassword]);
    const adminId = adminResult.rows[0].id;

    // Teachers (5)
    const teachers = [];
    const teacherNames = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "Robert Wilson"];
    const teacherEmails = ["john@school.com", "sarah@school.com", "michael@school.com", "emily@school.com", "robert@school.com"];

    for (let i = 0; i < 5; i++) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'teacher')
        RETURNING id
      `, [teacherNames[i], teacherEmails[i], hashedPassword]);
      teachers.push({ userId: result.rows[0].id, name: teacherNames[i] });
    }

    // Create teacher records
    const teacherIds = [];
    for (const teacher of teachers) {
      const result = await client.query(`
        INSERT INTO teachers (user_id)
        VALUES ($1)
        RETURNING id
      `, [teacher.userId]);
      teacherIds.push(result.rows[0].id);
    }

    // Parents (10)
    const parentUsers = [];
    for (let i = 1; i <= 10; i++) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'parent')
        RETURNING id
      `, [`Parent ${i}`, `parent${i}@email.com`, hashedPassword]);
      parentUsers.push(result.rows[0].id);
    }

    // Students (15) - linked to parents
    console.log("👥 Creating students...");
    const studentIds = [];
    for (let i = 1; i <= 15; i++) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'student')
        RETURNING id
      `, [`Student ${i}`, `student${i}@school.com`, hashedPassword]);

      const studentUserId = result.rows[0].id;
      const parentId = parentUsers[(i - 1) % parentUsers.length];

      const studentResult = await client.query(`
        INSERT INTO students (user_id, parent_id)
        VALUES ($1, $2)
        RETURNING id
      `, [studentUserId, parentId]);

      studentIds.push(studentResult.rows[0].id);
    }

    // ===== SEED COURSES =====
    console.log("📚 Creating courses...");
    const courseData = [
      { name: "Game Development", desc: "Advanced game development with modern engines" },
      { name: "Web Development", desc: "Full-stack web development bootcamp" },
      { name: "Mobile Apps", desc: "iOS and Android app development" },
      { name: "Python Programming", desc: "Python basics to advanced concepts" },
      { name: "Data Science", desc: "Data analysis and visualization" }
    ];

    const courseIds = [];
    for (const course of courseData) {
      const result = await client.query(`
        INSERT INTO courses (course_name, description)
        VALUES ($1, $2)
        RETURNING id
      `, [course.name, course.desc]);
      courseIds.push(result.rows[0].id);
    }

    // ===== SEED LESSONS =====
    console.log("📖 Creating lessons...");
    const lessonIds = [];
    const lessonsPerCourse = 5;

    for (const courseId of courseIds) {
      for (let i = 1; i <= lessonsPerCourse; i++) {
        // Vary lesson status: some not started, some in progress, some completed
        let status = "not_started";
        const rand = Math.random();
        if (rand > 0.7) status = "completed";
        else if (rand > 0.3) status = "in_progress";

        const result = await client.query(`
          INSERT INTO lessons (course_id, lesson_number, lesson_name, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [courseId, i, `Lesson ${i}`, status]);
        lessonIds.push({ id: result.rows[0].id, status, courseId });
      }
    }

    // ===== SEED CLASSES =====
    console.log("🏫 Creating classes...");
    const classIds = [];
    const classNames = ["Class A - Web Dev", "Class B - Game Dev", "Class C - Python", "Class D - Mobile"];
    
    for (const className of classNames) {
      const result = await client.query(`
        INSERT INTO classes (class_name, description)
        VALUES ($1, $2)
        RETURNING id
      `, [className, `${className} - Weekly classroom sessions`]);
      classIds.push(result.rows[0].id);
    }

    // ===== ASSIGN TEACHERS TO CLASSES =====
    console.log("👨‍🏫 Assigning teachers to classes...");
    for (const classId of classIds) {
      // 1-2 teachers per class
      const teachersForClass = Math.floor(Math.random() * 2) + 1;
      const assignedTeachers = new Set();
      
      while (assignedTeachers.size < teachersForClass) {
        const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
        if (!assignedTeachers.has(teacherId)) {
          assignedTeachers.add(teacherId);
          await client.query(`
            INSERT INTO class_teachers (class_id, teacher_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [classId, teacherId]);
        }
      }
    }

    // ===== ASSIGN STUDENTS TO CLASSES =====
    console.log("👨‍🎓 Assigning students to classes...");
    for (let i = 0; i < studentIds.length; i++) {
      // Each student is in 1-2 classes
      const classesForStudent = Math.floor(Math.random() * 2) + 1;
      const assignedClasses = new Set();
      
      while (assignedClasses.size < classesForStudent) {
        const classId = classIds[Math.floor(Math.random() * classIds.length)];
        if (!assignedClasses.has(classId)) {
          assignedClasses.add(classId);
          await client.query(`
            INSERT INTO class_students (class_id, student_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [classId, studentIds[i]]);
        }
      }
    }

    // ===== ASSIGN LESSONS TO STUDENTS =====
    console.log("📚 Assigning lessons to students...");
    for (const studentId of studentIds) {
      // Each student takes 1-3 lessons
      const lessonsForStudent = Math.floor(Math.random() * 3) + 1;
      const assignedLessons = new Set();
      
      while (assignedLessons.size < lessonsForStudent) {
        const lesson = lessonIds[Math.floor(Math.random() * lessonIds.length)];
        if (!assignedLessons.has(lesson.id)) {
          assignedLessons.add(lesson.id);
          await client.query(`
            INSERT INTO student_lessons (student_id, lesson_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [studentId, lesson.id]);
        }
      }
    }

    // ===== SEED MEETINGS =====
    console.log("📅 Creating meetings...");
    const meetingIds = [];
    let meetingCount = 0;

    // Create 2-3 meetings per class
    const meetingsPerClass = Math.floor(Math.random() * 2) + 2;
    
    for (const classId of classIds) {
      for (let m = 0; m < meetingsPerClass; m++) {
        const daysAgo = m * 7 + Math.floor(Math.random() * 2); // Weekly spacing
        
        const meetingDate = new Date();
        meetingDate.setDate(meetingDate.getDate() - daysAgo);

        const result = await client.query(`
          INSERT INTO meetings (class_id, date, attendance_code)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [classId, meetingDate.toISOString().split('T')[0], generateAttendanceCode()]);

        meetingIds.push(result.rows[0].id);
        meetingCount++;
      }
    }

    // ===== SEED ATTENDANCE =====
    console.log("✅ Creating attendance records...");
    let attendanceCount = 0;

    for (const meetingId of meetingIds) {
      // Get class for this meeting
      const classResult = await client.query(
        `SELECT class_id FROM meetings WHERE id = $1`,
        [meetingId]
      );
      const classId = classResult.rows[0].class_id;

      // Get students in this class
      const classStudentsResult = await client.query(
        `SELECT student_id FROM class_students WHERE class_id = $1`,
        [classId]
      );
      const classStudentIds = classStudentsResult.rows.map(r => r.student_id);

      // Random 50-80% of class students attend
      const attendanceRate = 0.5 + Math.random() * 0.3;
      const attendingCount = Math.ceil(classStudentIds.length * attendanceRate);
      const attendingStudents = classStudentIds.slice(0, Math.min(attendingCount, classStudentIds.length));

      // Add attendance for each student
      for (const studentId of attendingStudents) {
        // Get lessons assigned to this student
        const studentLessonsResult = await client.query(
          `SELECT lesson_id FROM student_lessons WHERE student_id = $1`,
          [studentId]
        );
        const studentLessons = studentLessonsResult.rows;

        // If student has lessons, randomly pick one for this meeting
        if (studentLessons.length > 0) {
          const lesson = studentLessons[Math.floor(Math.random() * studentLessons.length)];
          const status = Math.random() > 0.15 ? "present" : "absent"; // 85% present

          await client.query(`
            INSERT INTO attendance (student_id, meeting_id, lesson_id, status)
            VALUES ($1, $2, $3, $4)
          `, [studentId, meetingId, lesson.lesson_id, status]);
          attendanceCount++;
        }
      }
    }

    // ===== SEED FEEDBACK =====
    console.log("💬 Creating feedback records...");
    const feedbackTexts = [
      "Great work! Keep it up.",
      "Good progress, but needs improvement in specific areas.",
      "Excellent participation and understanding.",
      "Shows improvement from previous lessons.",
      "Needs more practice with concepts.",
      "Outstanding performance!",
      "Average performance, encourage to ask questions.",
      "Very creative approach to problem solving.",
      "Good effort, keep practicing.",
      "Excellent grasp of the material."
    ];

    let feedbackCount = 0;

    for (let i = 0; i < Math.min(meetingIds.length, 30); i++) {
      const meetingId = meetingIds[i];
      const teacherId = teacherIds[i % teacherIds.length];

      // 3-5 feedback per meeting
      const feedbackPerMeeting = Math.floor(Math.random() * 3) + 3;
      const feedbackStudents = studentIds.slice(0, feedbackPerMeeting);

      for (const studentId of feedbackStudents) {
        const feedback = feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)];
        const mediaUrl = Math.random() > 0.7 ? `https://example.com/video-${i}-${studentId}.mp4` : null;

        await client.query(`
          INSERT INTO meeting_feedback (meeting_id, student_id, teacher_id, feedback, media_url)
          VALUES ($1, $2, $3, $4, $5)
        `, [meetingId, studentId, teacherId, feedback, mediaUrl]);

        feedbackCount++;
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log(`📊 Statistics:`);
    console.log(`   - Admin: 1`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${studentIds.length}`);
    console.log(`   - Parents: ${parentUsers.length}`);
    console.log(`   - Classes: ${classIds.length}`);
    console.log(`   - Courses: ${courseIds.length}`);
    console.log(`   - Lessons: ${lessonIds.length}`);
    console.log(`   - Meetings: ${meetingCount}`);
    console.log(`   - Attendance Records: ${attendanceCount}`);
    console.log(`   - Feedback Records: ${feedbackCount}`);
    
    console.log("\n🔑 Test Credentials:");
    console.log(`   Admin: admin@school.com / password123`);
    console.log(`   Teacher: ${teacherEmails[0]} / password123`);
    console.log(`   Parent: parent1@email.com / password123`);
    console.log(`   Student: student1@school.com / password123`);

    await client.end();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDatabase();