const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");

router.get("/", authenticate, authorizeRoles("admin", "teacher"), courseController.getCourses);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher"), courseController.getCourseById);
router.post("/", authenticate, authorizeRoles("admin", "teacher"), courseController.createCourse);
router.put("/:id", authenticate, authorizeRoles("admin", "teacher"), courseController.updateCourse);
router.delete("/:id", authenticate, authorizeRoles("admin"), courseController.deleteCourse);

module.exports = router;