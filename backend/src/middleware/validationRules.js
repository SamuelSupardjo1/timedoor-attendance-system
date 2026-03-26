const { body } = require("express-validator");

const registerRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["student", "teacher", "parent", "admin"]).withMessage("Invalid role"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const userRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("role").isIn(["student", "teacher", "parent", "admin"]).withMessage("Invalid role"),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const studentRules = [
  body("user_id").isInt().withMessage("Valid user_id is required"),
  body("parent_id").optional().isInt().withMessage("parent_id must be an integer"),
];

const teacherRules = [
  body("user_id").isInt().withMessage("Valid user_id is required"),
];

const courseRules = [
  body("course_name").notEmpty().withMessage("Course name is required"),
  body("description").optional().isString(),
];

const lessonRules = [
  body("course_id").isInt().withMessage("Valid course_id is required"),
  body("lesson_number").isInt().withMessage("Lesson number must be an integer"),
  body("lesson_name").notEmpty().withMessage("Lesson name is required"),
];

const meetingRules = [
  body("lesson_id").isInt().withMessage("Valid lesson_id is required"),
  body("teacher_id").isInt().withMessage("Valid teacher_id is required"),
  body("date").isDate().withMessage("Valid date is required (YYYY-MM-DD)"),
];

const attendanceRules = [
  body("student_id").isInt().withMessage("Valid student_id is required"),
  body("attendance_code").notEmpty().withMessage("Attendance code is required"),
];

const updateAttendanceRules = [
  body("status").isIn(["present", "absent"]).withMessage("Status must be present or absent"),
];

const feedbackRules = [
  body("meeting_id").isInt().withMessage("Valid meeting_id is required"),
  body("student_id").isInt().withMessage("Valid student_id is required"),
  body("teacher_id").isInt().withMessage("Valid teacher_id is required"),
  body("feedback").notEmpty().withMessage("Feedback is required"),
  body("media_url").optional().isURL().withMessage("media_url must be a valid URL"),
];

module.exports = {
  registerRules,
  loginRules,
  userRules,
  studentRules,
  teacherRules,
  courseRules,
  lessonRules,
  meetingRules,
  attendanceRules,
  updateAttendanceRules,
  feedbackRules,
};