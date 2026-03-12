const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "attendance_system",
  password: "admin", 
  port: 5432,
});

async function setupDatabase() {
  try {
    await client.connect();

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await client.query(schema);

    console.log("✅ Database tables created successfully!");

    await client.end();
  } catch (err) {
    console.error("❌ Error setting up database:", err);
  }
}

setupDatabase();