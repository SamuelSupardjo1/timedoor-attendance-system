const classModel = require("../models/classModel");

// Create a new class
const createClass = async (req, res) => {
  try {
    const { class_name, description } = req.body;
    const newClass = await classModel.createClass(class_name, description);
    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get all classes
const getClasses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const classes = await classModel.getClasses(page, limit, search);
    res.json(classes);
  } catch (err) {
    next(err);
  }
};

// Get class by ID
const getClassById = async (req, res, next) => {
  try {
    const classData = await classModel.getClassById(req.params.id);
    if (!classData) return res.status(404).json({ message: "Class not found" });
    res.json(classData);
  } catch (err) {
    next(err);
  }
};

// Update class
const updateClass = async (req, res, next) => {
  try {
    const { class_name, description } = req.body;
    const updated = await classModel.updateClass(req.params.id, class_name, description);
    if (!updated) return res.status(404).json({ message: "Class not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete class
const deleteClass = async (req, res, next) => {
  try {
    const deleted = await classModel.deleteClass(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted", deleted });
  } catch (err) {
    next(err);
  }
};

// Add teacher to class
const addTeacherToClass = async (req, res, next) => {
  try {
    const { class_id, teacher_id } = req.body;
    const result = await classModel.addTeacherToClass(class_id, teacher_id);
    res.status(201).json(result || { message: "Teacher already in class" });
  } catch (err) {
    next(err);
  }
};

// Remove teacher from class
const removeTeacherFromClass = async (req, res, next) => {
  try {
    const { class_id, teacher_id } = req.body;
    const result = await classModel.removeTeacherFromClass(class_id, teacher_id);
    res.json(result || { message: "Teacher not in class" });
  } catch (err) {
    next(err);
  }
};

// Get students in class
const getClassStudents = async (req, res, next) => {
  try {
    const students = await classModel.getClassStudents(req.params.id);
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// Add student to class
const addStudentToClass = async (req, res, next) => {
  try {
    const { class_id, student_id } = req.body;
    const result = await classModel.addStudentToClass(class_id, student_id);
    res.status(201).json(result || { message: "Student already in class" });
  } catch (err) {
    next(err);
  }
};

// Remove student from class
const removeStudentFromClass = async (req, res, next) => {
  try {
    const { class_id, student_id } = req.body;
    const result = await classModel.removeStudentFromClass(class_id, student_id);
    res.json(result || { message: "Student not in class" });
  } catch (err) {
    next(err);
  }
};

// Assign lesson to student
const assignLessonToStudent = async (req, res, next) => {
  try {
    const { student_id, lesson_id } = req.body;
    const result = await classModel.assignLessonToStudent(student_id, lesson_id);
    res.status(201).json(result || { message: "Lesson already assigned" });
  } catch (err) {
    next(err);
  }
};

// Remove lesson from student
const removeLessonFromStudent = async (req, res, next) => {
  try {
    const { student_id, lesson_id } = req.body;
    const result = await classModel.removeLessonFromStudent(student_id, lesson_id);
    res.json(result || { message: "Lesson not assigned" });
  } catch (err) {
    next(err);
  }
};

// Get student's lessons
const getStudentLessons = async (req, res, next) => {
  try {
    const lessons = await classModel.getStudentLessons(req.params.id);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
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
  addStudentToClass,
  removeStudentFromClass,
  assignLessonToStudent,
  removeLessonFromStudent,
  getStudentLessons
};
