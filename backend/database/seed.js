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
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
};

async function seedDatabase() {
  try {
    await client.connect();

    console.log("🌱 Seeding database with Real Case Scenarios (Timedoor Coding Academy)...");

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
    console.log("📝 Creating admin & teachers...");

    // Admin User
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Timedoor Admin', 'admin@timedooracademy.com', $1, 'admin')
      RETURNING id
    `, [hashedPassword]);
    const adminId = adminResult.rows[0].id;

    // Teachers (5)
    const teachers = [];
    const teacherNames = [
      "Coach Andre Kurnia",
      "Coach Bella Amanda",
      "Coach Yusuf Hidayat",
      "Coach Devy Natalia",
      "Coach Rian Wijaya"
    ];
    const teacherEmails = [
      "andre@timedooracademy.com",
      "bella@timedooracademy.com",
      "yusuf@timedooracademy.com",
      "devy@timedooracademy.com",
      "rian@timedooracademy.com"
    ];

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
    console.log("👪 Creating parents...");
    const parentNames = [
      "Bapak Budi Hartono",
      "Ibu Christine Wijaya",
      "Bapak Setiawan Pratama",
      "Ibu Helena Siregar",
      "Bapak Gunawan Sulistyo",
      "Ibu Diana Safitri",
      "Bapak Adrian Hartanto",
      "Ibu Siska Natalia",
      "Bapak Hendra Lesmana",
      "Ibu Meliana Halim"
    ];
    const parentEmails = [
      "budi.hartono@gmail.com",
      "christine.wijaya@gmail.com",
      "setiawan.p@gmail.com",
      "helena.s@gmail.com",
      "gunawan.s@gmail.com",
      "diana.safitri@gmail.com",
      "adrian.h@gmail.com",
      "siska.n@gmail.com",
      "hendra.l@gmail.com",
      "meliana.h@gmail.com"
    ];

    const parentUsers = [];
    for (let i = 0; i < 10; i++) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'parent')
        RETURNING id
      `, [parentNames[i], parentEmails[i], hashedPassword]);
      parentUsers.push(result.rows[0].id);
    }

    // Students (12) - linked to parents
    console.log("👦 Creating students...");
    const studentNames = [
      "Alvin Pratama", "Clara Santoso", "Daniel Wijaya", "Ethan Hartono", 
      "Fiona Siregar", "Gabriel Sulistyo", "Ivan Safitri", "Jessica Hartanto",
      "Kevin Lesmana", "Laura Halim", "Matthew Setiawan", "Naomi Kurnia"
    ];
    const studentEmails = [
      "alvin@student.timedoor.com", "clara@student.timedoor.com", "daniel@student.timedoor.com", "ethan@student.timedoor.com",
      "fiona@student.timedoor.com", "gabriel@student.timedoor.com", "ivan@student.timedoor.com", "jessica@student.timedoor.com",
      "kevin@student.timedoor.com", "laura@student.timedoor.com", "matthew@student.timedoor.com", "naomi@student.timedoor.com"
    ];

    const studentIds = [];
    for (let i = 0; i < studentNames.length; i++) {
      const result = await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'student')
        RETURNING id
      `, [studentNames[i], studentEmails[i], hashedPassword]);

      const studentUserId = result.rows[0].id;
      const parentId = parentUsers[i % parentUsers.length]; // Link to parent

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
      { name: "Roblox Game Developer", desc: "Learn Lua Scripting, 3D Design, and Game Mechanics in Roblox Studio" },
      { name: "Web Development Starter", desc: "Build Responsive Websites using HTML5, CSS3, Flexbox, and Vanilla JS" },
      { name: "Python for Kids & AI", desc: "Introduction to Logic, Pygame Development, and Artificial Intelligence" }
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
    const lessonsData = {
      [courseIds[0]]: [
        "Roblox Studio UI & Interface",
        "Introduction to Lua Programming",
        "Variables & Working with Parts",
        "Functions & Triggering Events",
        "Loops & Spawning Obstacles",
        "Creating an Obby Game",
        "Advanced Tweens & Part Movement",
        "Leaderboards & Player Data Saving"
      ],
      [courseIds[1]]: [
        "HTML5 Structure & Semantic Tags",
        "CSS3 Colors, Backgrounds & Borders",
        "Box Model & Margin Padding",
        "Responsive Flexbox Layouts",
        "JavaScript Syntax & Functions",
        "DOM Manipulation & Event Listeners",
        "Fetching API Data dynamically",
        "React Component Lifecycle Basics"
      ],
      [courseIds[2]]: [
        "Introduction to Python & Variables",
        "Conditional Statements (If-Else)",
        "Lists, Tuples, & Dictionaries",
        "While & For Loops in Automation",
        "Drawing Shapes with Turtle Graphics",
        "Setting up Pygame Screen",
        "Handling Keyboard Inputs & Movement",
        "Basic AI Bot with Logic Controls"
      ]
    };

    const lessonIds = [];
    for (const courseId of courseIds) {
      const lessons = lessonsData[courseId];
      for (let i = 0; i < lessons.length; i++) {
        let status = "not_started";
        if (i < 3) status = "completed";
        else if (i === 3) status = "in_progress";

        const result = await client.query(`
          INSERT INTO lessons (course_id, lesson_number, lesson_name, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [courseId, i + 1, lessons[i], status]);
        lessonIds.push({ id: result.rows[0].id, status, courseId });
      }
    }

    // ===== SEED CLASSES =====
    console.log("🏫 Creating classes...");
    const classNames = [
      "Saturday Roblox Junior",
      "Sunday Web Coding Advanced",
      "Friday Python Basics"
    ];
    const classDescriptions = [
      "Roblox Coding Class for ages 9-12 (Saturday 09:00 - 11:00)",
      "Web Coding Bootcamp for ages 13-16 (Sunday 13:00 - 15:00)",
      "Python and Logic Coding for ages 10-14 (Friday 16:00 - 18:00)"
    ];
    
    const classIds = [];
    for (let i = 0; i < classNames.length; i++) {
      const result = await client.query(`
        INSERT INTO classes (class_name, description)
        VALUES ($1, $2)
        RETURNING id
      `, [classNames[i], classDescriptions[i]]);
      classIds.push(result.rows[0].id);
    }

    // ===== ASSIGN TEACHERS TO CLASSES =====
    console.log("👨‍🏫 Assigning teachers to classes...");
    // Class 0 -> Coach Andre
    await client.query(`INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)`, [classIds[0], teacherIds[0]]);
    // Class 1 -> Coach Bella & Coach Yusuf
    await client.query(`INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)`, [classIds[1], teacherIds[1]]);
    await client.query(`INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)`, [classIds[1], teacherIds[2]]);
    // Class 2 -> Coach Devy
    await client.query(`INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)`, [classIds[2], teacherIds[3]]);

    // ===== ASSIGN STUDENTS TO CLASSES & ENROLL THEM TO SINGLE COURSE LESSONS =====
    console.log("👨‍🎓 Assigning students to classes & lessons (Constraint Enforced)...");
    
    // Roblox Class Students (Student 1-4)
    const robloxStudents = studentIds.slice(0, 4);
    const robloxLessons = lessonIds.filter(l => l.courseId === courseIds[0]);
    for (const studentId of robloxStudents) {
      await client.query(`INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)`, [classIds[0], studentId]);
      // Assign Roblox lessons (level 1-4)
      for (let j = 0; j < 4; j++) {
        await client.query(`INSERT INTO student_lessons (student_id, lesson_id) VALUES ($1, $2)`, [studentId, robloxLessons[j].id]);
      }
    }

    // Web Coding Class Students (Student 5-8)
    const webStudents = studentIds.slice(4, 8);
    const webLessons = lessonIds.filter(l => l.courseId === courseIds[1]);
    for (const studentId of webStudents) {
      await client.query(`INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)`, [classIds[1], studentId]);
      // Assign Web lessons (level 1-4)
      for (let j = 0; j < 4; j++) {
        await client.query(`INSERT INTO student_lessons (student_id, lesson_id) VALUES ($1, $2)`, [studentId, webLessons[j].id]);
      }
    }

    // Python Class Students (Student 9-12)
    const pythonStudents = studentIds.slice(8, 12);
    const pythonLessons = lessonIds.filter(l => l.courseId === courseIds[2]);
    for (const studentId of pythonStudents) {
      await client.query(`INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)`, [classIds[2], studentId]);
      // Assign Python lessons (level 1-4)
      for (let j = 0; j < 4; j++) {
        await client.query(`INSERT INTO student_lessons (student_id, lesson_id) VALUES ($1, $2)`, [studentId, pythonLessons[j].id]);
      }
    }

    // ===== SEED MEETINGS =====
    console.log("📅 Creating meetings...");
    const meetingIds = [];
    const meetingDates = [
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // 1 week ago
      new Date(),                                     // today
    ];

    for (let c = 0; c < classIds.length; c++) {
      for (let m = 0; m < meetingDates.length; m++) {
        const result = await client.query(`
          INSERT INTO meetings (class_id, date, attendance_code)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [classIds[c], meetingDates[m].toISOString().split('T')[0], generateAttendanceCode()]);
        meetingIds.push({ id: result.rows[0].id, classIndex: c, meetingIndex: m });
      }
    }

    // ===== SEED ATTENDANCE =====
    console.log("✅ Creating attendance records...");
    let attendanceCount = 0;

    for (const mObj of meetingIds) {
      // Find class students
      let targetStudents = [];
      let targetLessons = [];
      if (mObj.classIndex === 0) {
        targetStudents = robloxStudents;
        targetLessons = robloxLessons;
      } else if (mObj.classIndex === 1) {
        targetStudents = webStudents;
        targetLessons = webLessons;
      } else {
        targetStudents = pythonStudents;
        targetLessons = pythonLessons;
      }

      // Assign lesson based on meeting index (Meeting 0 -> Lesson 0, Meeting 1 -> Lesson 1...)
      const activeLesson = targetLessons[mObj.meetingIndex % targetLessons.length];

      for (const studentId of targetStudents) {
        const status = Math.random() > 0.1 ? "present" : "absent";
        let codeSubmitted = null;
        let approvalStatus = "pending";
        let submittedAt = null;
        let approvedAt = null;

        if (status === "present") {
          codeSubmitted = generateAttendanceCode();
          submittedAt = new Date(meetingDates[mObj.meetingIndex].getTime() + 15 * 60 * 1000); // 15 mins after class start
          
          if (mObj.meetingIndex < 2) { // past meetings
            approvalStatus = "approved";
            approvedAt = new Date(submittedAt.getTime() + 5 * 60 * 1000);
          }
        } else {
          if (mObj.meetingIndex < 2) {
            approvalStatus = "rejected";
          }
        }

        await client.query(`
          INSERT INTO attendance (student_id, meeting_id, lesson_id, status, code_submitted, approval_status, submitted_at, approved_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [studentId, mObj.id, activeLesson.id, status, codeSubmitted, approvalStatus, submittedAt, approvedAt]);
        attendanceCount++;
      }
    }

    // ===== SEED FEEDBACK =====
    console.log("💬 Creating feedback records...");
    const feedbackTexts = [
      "Sangat aktif dalam kelas dan berhasil menyelesaikan coding challenges dengan cepat.",
      "Memiliki logika berpikir yang bagus, namun perlu lebih teliti ketika mengetik sintaks.",
      "Mampu mendemonstrasikan hasil karyanya dengan sangat percaya diri hari ini.",
      "Memahami konsep perulangan dengan baik. Bagus sekali progresnya!",
      "Sedikit kesulitan fokus di awal kelas, tetapi berhasil mengejar materi di akhir sesi.",
      "Hasil kodingan berjalan tanpa bug! Pemahaman logika dasar sangat solid."
    ];

    let feedbackCount = 0;
    // Feedback for past meetings only
    const pastMeetings = meetingIds.filter(m => m.meetingIndex < 2);
    for (const mObj of pastMeetings) {
      let targetStudents = mObj.classIndex === 0 ? robloxStudents : mObj.classIndex === 1 ? webStudents : pythonStudents;
      let teacherId = mObj.classIndex === 0 ? teacherIds[0] : mObj.classIndex === 1 ? teacherIds[1] : teacherIds[3];

      for (const studentId of targetStudents) {
        const feedback = feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)];
        await client.query(`
          INSERT INTO meeting_feedback (meeting_id, student_id, teacher_id, feedback)
          VALUES ($1, $2, $3, $4)
        `, [mObj.id, studentId, teacherId, feedback]);
        feedbackCount++;
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log(`📊 Real-Case Statistics:`);
    console.log(`   - Teachers: 5 (Andre, Bella, Yusuf, Devy, Rian)`);
    console.log(`   - Parents: 10`);
    console.log(`   - Students: 12`);
    console.log(`   - Courses: 3 (Roblox, Web Dev, Python)`);
    console.log(`   - Lessons: 24 (8 lessons per course)`);
    console.log(`   - Classes: 3 (Saturday Roblox, Sunday Web, Friday Python)`);
    console.log(`   - Attendance Records: ${attendanceCount}`);
    console.log(`   - Feedback Records: ${feedbackCount}`);
    
    console.log("\n🔑 Test Credentials:");
    console.log(`   Admin: admin@timedooracademy.com / password123`);
    console.log(`   Teacher (Roblox): andre@timedooracademy.com / password123`);
    console.log(`   Parent: budi.hartono@gmail.com / password123`);
    console.log(`   Student (Alvin): alvin@student.timedoor.com / password123`);

    await client.end();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDatabase();