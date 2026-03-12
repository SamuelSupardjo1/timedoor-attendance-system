CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password TEXT,
  role VARCHAR(20)
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  parent_id INT REFERENCES users(id)
);

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_name VARCHAR(100),
  description TEXT
);

CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id),
  lesson_number INT,
  lesson_name VARCHAR(100),
  teacher_id INT REFERENCES teachers(id),
  date DATE,
  attendance_code VARCHAR(20)
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  lesson_id INT REFERENCES lessons(id),
  status VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lesson_feedback (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id),
  student_id INT REFERENCES students(id),
  teacher_id INT REFERENCES teachers(id),
  feedback TEXT,
  media_url TEXT
);