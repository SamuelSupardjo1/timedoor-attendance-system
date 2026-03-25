const pool = require("../config/db");

const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

const createUser = async (name, email, hashedPassword, role, parent_id = null) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role]
  );

  const user = result.rows[0];

  if (role === 'teacher') {
    await pool.query(
      `INSERT INTO teachers (user_id) VALUES ($1)`,
      [user.id]
    );
  } else if (role === 'student') {
    await pool.query(
      `INSERT INTO students (user_id, parent_id) VALUES ($1, $2)`,
      [user.id, parent_id]
    );
  }

  return user;
};

module.exports = { getUserByEmail, createUser, getUserById };