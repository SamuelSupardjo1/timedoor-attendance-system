-- USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password TEXT,
  role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'parent', 'admin'))
);

-- STUDENTS
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  parent_id INT REFERENCES users(id)
);

-- TEACHERS
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- COURSES
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_name VARCHAR(100),
  description TEXT
);

-- LESSONS 
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number INT,
  lesson_name VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started'
);

-- CLASSES
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLASS_TEACHERS (many-to-many: teachers in classes)
CREATE TABLE class_teachers (
  class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, teacher_id)
);

-- CLASS_STUDENTS (many-to-many: students in classes)
CREATE TABLE class_students (
  class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, student_id)
);

-- STUDENT_LESSONS (admin assigns specific lessons to students)
CREATE TABLE student_lessons (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, lesson_id)
);

-- MEETINGS
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  class_id INT REFERENCES classes(id) ON DELETE CASCADE,
  date DATE,
  attendance_code VARCHAR(10)
);

-- ATTENDANCE 
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  meeting_id INT REFERENCES meetings(id) ON DELETE CASCADE,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(10) CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEETING FEEDBACK 
CREATE TABLE meeting_feedback (
  id SERIAL PRIMARY KEY,
  meeting_id INT REFERENCES meetings(id) ON DELETE CASCADE,
  student_id INT REFERENCES students(id),
  teacher_id INT REFERENCES teachers(id),
  feedback TEXT,
  media_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);