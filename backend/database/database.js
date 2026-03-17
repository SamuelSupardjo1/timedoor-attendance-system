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

// DROP ALL
async function dropAll() {
  await client.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);

  console.log("✅ All tables & relations deleted");
}

// RESET
async function resetDatabase() {
  await client.query(`
    TRUNCATE TABLE 
      attendance,
      lesson_feedback,
      lessons,
      students,
      teachers,
      users
    RESTART IDENTITY CASCADE;
  `);
  console.log("✅ Database reset");
}

// SETUP
async function setupDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await client.query(schema);
  console.log("✅ Tables created");
}

// MAIN CONTROLLER
async function main() {
  const action = process.argv[2]; 

  try {
    await client.connect();

    if (action === "reset") {
      await resetDatabase();
    } else if (action === "setup") {
      await setupDatabase();
    } else if (action === "drop") {
      await dropAll();
    } else if (action === "all") {
      await dropAll();      
      await setupDatabase(); 
    } else {
      console.log("❗ Use: node database.js [reset|setup|drop|all]");
    }

    await client.end();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();