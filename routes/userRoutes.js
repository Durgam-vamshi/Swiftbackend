const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();


router.get("/load", userController.loadUsers);
router.delete("/users", userController.deleteAllUsers);
router.delete("/users/:userId", userController.deleteUser);
router.get("/users/:userId", userController.getUserById);
router.put("/users", userController.addUser);


module.exports = router;
