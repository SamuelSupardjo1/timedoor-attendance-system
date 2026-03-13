const express = require("express");
const userRoutes = require("./src/routes/userRoutes");
const studentRoutes = require("./src/routes/studentRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/students", studentRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});