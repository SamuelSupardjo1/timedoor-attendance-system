const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { courseRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), courseController.getCourses);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), courseController.getCourseById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), courseRules, validate, courseController.createCourse);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), courseRules, validate, courseController.updateCourse);
router.delete("/:id", authenticate, authorizeRoles("admin"), courseController.deleteCourse);

module.exports = router;