const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { studentRules } = require("../middleware/validationRules");
const validate = require("../middleware/validate");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "parent"), studentController.getStudents);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "parent"), studentController.getStudentById);
router.post("/", authenticate, authorizeRoles("admin"), studentRules, validate, studentController.createStudent);
router.put("/:id", authenticate, authorizeRoles("admin"), studentRules, validate, studentController.updateStudent);
router.delete("/:id", authenticate, authorizeRoles("admin"), studentController.deleteStudent);


module.exports = router;