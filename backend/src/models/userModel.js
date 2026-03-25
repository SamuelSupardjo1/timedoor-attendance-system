const pool = require("../config/db");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const createUser = async (name, email, role, parent_id = null) => {
  const result = await pool.query(
    "INSERT INTO users (name,email,role) VALUES ($1,$2,$3) RETURNING *",
    [name, email, role]
  );
  
  const user = result.rows[0];
  
  if (role === 'teacher') {
    await pool.query(
      "INSERT INTO teachers (user_id) VALUES ($1)",
      [user.id]
    );
  } else if (role === 'student') {
    await pool.query(
      "INSERT INTO students (user_id, parent_id) VALUES ($1, $2)",
      [user.id, parent_id]
    );
  }
  
  return user;
}
const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const updateUser = async (id, name, email, role) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2, role = $3
     WHERE id = $4
     RETURNING *`,
    [name, email, role, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAllUsers, createUser, getUserById, updateUser, deleteUser
};