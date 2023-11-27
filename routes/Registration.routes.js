const express = require("express");
const upload = require("../utilities/upload");

const {
  handleUserRegistration,
} = require("../controllers/Registration.controller");

const router = express.Router();

router.post(
  "/handleUserRegistration",
  upload.single("profileImage"),
  handleUserRegistration
);

module.exports = router;
