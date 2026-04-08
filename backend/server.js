const cors = require("cors");
require("dotenv").config();
const express = require("express");
const errorHandler = require("./src/middleware/errorHandler");

const userRoutes = require("./src/routes/userRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const lessonRoutes = require("./src/routes/lessonRoutes");
const classRoutes = require("./src/routes/classRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const meetingFeedbackRoutes = require("./src/routes/meetingFeedbackRoutes");
const meetingRoutes = require("./src/routes/meetingRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/users", userRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/classes", classRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/meeting-feedback", meetingFeedbackRoutes);
app.use("/meetings", meetingRoutes);
app.use("/auth", authRoutes);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});