const studentModel = require("../models/studentModel");
const responseHandler = require("../utils/responseHandler");

const createStudent = async (req, res, next) => {
  try {
    const { user_id, parent_id } = req.body;

    const student = await studentModel.createStudent(user_id, parent_id);

    responseHandler.success(res, 201, student, "Student created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    // If user is a parent, automatically filter for their children
    const parent_id = req.user.role === 'parent' ? req.user.id : req.query.parent_id || null;
    
    const students = await studentModel.getStudents(page, limit, search, parent_id);
    responseHandler.success(res, 200, students);
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) return responseHandler.notFound(res, "Student not found");
    responseHandler.success(res, 200, student);
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { user_id, parent_id } = req.body;
    const student = await studentModel.updateStudent(req.params.id, user_id, parent_id);
    if (!student) return responseHandler.notFound(res, "Student not found");
    responseHandler.success(res, 200, student, "Student updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentModel.deleteStudent(req.params.id);
    if (!student) return responseHandler.notFound(res, "Student not found");
    responseHandler.success(res, 200, student, "Student deleted successfully", "DELETED");
  } catch (err) {
    next(err);
  }
};

// Get current logged-in student's profile
const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentByUserId(req.user.id);
    if (!student) return responseHandler.notFound(res, "Student profile not found");
    responseHandler.success(res, 200, student);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  getMyStudentProfile,
  updateStudent,
  deleteStudent
};