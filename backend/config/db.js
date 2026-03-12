const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "attendance_system",
  password: "admin",
  port: 5432,
});

module.exports = pool;