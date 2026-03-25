const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, authorizeRoles("admin"), userController.getUsers);
router.get("/:id", authenticate, authorizeRoles("admin"), userController.getUserById);
router.post("/", authenticate, authorizeRoles("admin"), userController.createUser);
router.put("/:id", authenticate, authorizeRoles("admin"), userController.updateUser);
router.delete("/:id", authenticate, authorizeRoles("admin"), userController.deleteUser);

module.exports = router;