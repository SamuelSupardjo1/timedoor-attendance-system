const pool = require("../config/db");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const createUser = async (name, email, role) => {
  const result = await pool.query(
    "INSERT INTO users (name,email,role) VALUES ($1,$2,$3) RETURNING *",
    [name, email, role]
  );
  return result.rows[0];
}
module.exports = {
  getAllUsers, createUser
};