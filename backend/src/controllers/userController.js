const userModel = require("../models/userModel");

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userModel.getAllUsers(page, limit);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, role, parent_id } = req.body;

    const newUser = await userModel.createUser(name, email, role, parent_id);

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await userModel.updateUser(req.params.id, name, email, role, password)
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await userModel.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted", user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, getUserById, updateUser, deleteUser };