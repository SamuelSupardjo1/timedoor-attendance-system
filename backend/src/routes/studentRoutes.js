const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", authenticate, authorizeRoles("admin", "teacher", "parent"), studentController.getStudents);
router.get("/:id", authenticate, authorizeRoles("admin", "teacher", "parent"), studentController.getStudentById);
router.post("/", authenticate, authorizeRoles("admin"), studentController.createStudent);
router.put("/:id", authenticate, authorizeRoles("admin"), studentController.updateStudent);
router.delete("/:id", authenticate, authorizeRoles("admin"), studentController.deleteStudent);


module.exports = router;