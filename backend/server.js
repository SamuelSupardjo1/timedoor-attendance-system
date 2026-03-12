const express = require("express");
const pool = require("./config/db");

const app = express();
app.use(express.json());

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ Database connection error:", err));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});