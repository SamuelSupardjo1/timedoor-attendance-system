const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const responseHandler = require("../utils/responseHandler");

const getMe = async (req, res, next) => {
  try {
    const user = await authModel.getUserById(req.user.id);
    if (!user) return responseHandler.notFound(res, "User not found");
    responseHandler.success(res, 200, user);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, parent_id } = req.body;

    const existing = await authModel.getUserByEmail(email);
    if (existing) return responseHandler.conflict(res, "Email already in use");
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authModel.createUser(name, email, hashedPassword, role, parent_id);
    responseHandler.success(res, 201, { user }, "User registered successfully", "CREATED");
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authModel.getUserByEmail(email);
    if (!user) return responseHandler.notFound(res, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return responseHandler.error(res, 400, "Invalid credentials", "INVALID_CREDENTIALS");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    responseHandler.success(res, 200, { token, user }, "Login successful");
  } catch (err) {
    next(err);
  }
};

module.exports = {register, login, getMe};