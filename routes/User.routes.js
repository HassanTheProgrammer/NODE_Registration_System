const express = require("express");
const upload = require("../middlewares/upload.middleware");
const userVarification = require("../middlewares/userVarification.middleware");

const userController = require("../controllers/User.controller");

const router = express.Router();

/**
 * handleUserRegistration
 */
router.post(
  "/handleUserRegistration",
  upload.single("profileImage"),
  userController.handleUserRegistration
);

/**
 * handleUserLogin
 */
router.post("/handleUserLogin", userController.handleUserLogin);

/**
 * handleGetUserData
 */
router.get(
  "/handleGetUserData",
  userVarification,
  userController.handleGetUserData
);

/**
 * handleForgotPassword
 */
router.post("/handleForgotPassword", userController.handleForgotPassword);
module.exports = router;
