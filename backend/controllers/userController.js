const userModel = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const newUser = await userModel.createUser(name, email, role);

    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

module.exports = { getUsers, createUser };