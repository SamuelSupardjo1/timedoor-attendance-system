const userModel = require("../models/userModel");
const responseHandler = require("../utils/responseHandler");

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userModel.getAllUsers(page, limit);
    responseHandler.success(res, 200, users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, role, parent_id } = req.body;

    const newUser = await userModel.createUser(name, email, role, parent_id);

    responseHandler.success(res, 201, newUser, "User created successfully", "CREATED");
  } catch (err) {
    next(err);
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return responseHandler.notFound(res, "User not found");
    responseHandler.success(res, 200, user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await userModel.updateUser(req.params.id, name, email, role, password)
    if (!user) return responseHandler.notFound(res, "User not found");
    responseHandler.success(res, 200, user, "User updated successfully", "UPDATED");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await userModel.deleteUser(req.params.id);
    if (!user) return responseHandler.notFound(res, "User not found");
    responseHandler.success(res, 200, user, "User deleted successfully", "DELETED");
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, getUserById, updateUser, deleteUser };