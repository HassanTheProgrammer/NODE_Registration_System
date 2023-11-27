const RegistrationModel = require("../models/Registration.model");
const { validateEmail } = require("../utilities/validateEmail");
const path = require("path");

/**
 * uerRegistration
 */
exports.handleUserRegistration = async (req, res) => {
  try {
    const { fullName, cnic, email, password, confirmPassword } = req.body;
    if (!fullName || !cnic || !email || !password || !confirmPassword) {
      /**
       * 204 No Content
       */
      res
        .status(204)
        .json({ success: false, message: "Missing Required Fields!" });
    } else {
      if (!validateEmail(email)) {
        /**
         * 403 Forbidden (Invalid Input)
         */
        res
          .status(403)
          .json({ success: false, message: "Invalid Email Address!" });
      }
      if (confirmPassword) {
        if (password !== confirmPassword) {
          /**
           * 400 Bad Request
           */
          res.status(400).json({
            success: false,
            message: "Password and Confirm Password input fields must be same!",
          });
        }
      } else {
        res
          .status(204)
          .json({ success: false, message: "Missing Required Fields!" });
      }
      await new RegistrationModel.create({
        fullName,
        cnic,
        email,
        password,
        image: req.file.path,
      });
    }
  } catch (error) {}
};
