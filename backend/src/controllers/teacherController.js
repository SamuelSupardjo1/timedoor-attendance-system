const teacherModel = require("../models/teacherModel");
const responseHandler = require("../utils/responseHandler");

const createTeacher = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    const teacher = await teacherModel.createTeacher(user_id);

    responseHandler.success(res, 201, teacher, "Teacher created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const teachers = await teacherModel.getTeachers(page, limit, search);
    responseHandler.success(res, 200, teachers);
  } catch (err) {
    next(err);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacherById(req.params.id);
    if (!teacher) return responseHandler.notFound(res, "Teacher not found");
    responseHandler.success(res, 200, teacher);
  } catch (err) {
    next(err);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const teacher = await teacherModel.updateTeacher(req.params.id, user_id);
    if (!teacher) return responseHandler.notFound(res, "Teacher not found");
    responseHandler.success(res, 200, teacher, "Teacher updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherModel.deleteTeacher(req.params.id);
    if (!teacher) return responseHandler.notFound(res, "Teacher not found");
    responseHandler.success(res, 200, teacher, "Teacher deleted successfully", "DELETED");
  } catch (err) {
    next(err);
  }
};

const getMyTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacherByUserId(req.user.id);
    if (!teacher) return responseHandler.notFound(res, "Teacher profile not found");
    responseHandler.success(res, 200, teacher);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  getMyTeacherProfile,
  updateTeacher,
  deleteTeacher
};