const express = require("express");
const userRoutes = require("./src/routes/userRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const lessonRoutes = require("./src/routes/lessonRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const meetingFeedbackRoutes = require("./src/routes/meetingFeedbackRoutes");
const meetingRoutes = require("./src/routes/meetingRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/meeting-feedback", meetingFeedbackRoutes);
app.use("/meetings", meetingRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});