const User = require("../models/User.model");
const { validateEmail } = require("../utils/validateEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * uerRegistration
 */
exports.handleUserRegistration = async (req, res) => {
  try {
    const { fullName, cnic, email, password, confirmPassword } = req.body;
    if (!fullName || !cnic || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Required Fields!" });
    } else {
      if (!validateEmail(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Email Address!" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password and Confirm Password input fields must be same!",
        });
      }

      const salt = await bcrypt.genSalt(10);
      await bcrypt.hash(password, salt, async (error, hash) => {
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Error during hasing password",
            error,
            hash,
          });
        } else {
          await User.create({
            fullName,
            cnic,
            email,
            password: hash,
            image: req.file.path,
          })
            .then((user) => {
              const jwtToken = JWTTokenGenerator(user._id);
              res.status(200).json({
                success: true,
                message: "User Registered Successfully",
                jwtToken,
              });
            })
            .catch((error) => {
              res.status(400).json({
                success: false,
                message: "Error during user registeration",
                error: error.message,
              });
            });
        }
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * handleUserLogin
 */
exports.handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Required Empty Email" });
    } else {
      validateEmail(email)
        ? null
        : res
            .status(400)
            .json({ success: false, message: "Invalid Login Email" });
    }

    let user = await User.findOne({ email });
    if (user) {
      const comparedPassword = await bcrypt.compare(password, user.password);
      if (!comparedPassword) {
        res
          .status(400)
          .json({ success: false, message: "Invalid Email or Password" });
      }

      const jwtToken = JWTTokenGenerator(user._id);
      res.status(200).json({
        success: true,
        message: "Login Successfully",
        jwtToken,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid Login Credentials - User Not Found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error in LoginUser",
      errorMessage: error.message,
    });
  }
};

/**
 * handleGetUserData
 */

exports.handleGetUserData = async (req, res) => {
  try {
    const id = req.data.id;
    const user = await User.findById(id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Internal Server Error!" });
  }
};

/**
 * handleForgotPassword
 */
exports.handleForgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    console.log(email);
    email = email?.toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        messsage: "Please enter a valid email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Not user found with email address",
      });
    }
    const forgotPasswordOTP = (
      Math.floor(Math.random() * 899999) + 100000
    ).toString();
    console.log("Forgot Password: ", forgotPasswordOTP);
    const salt = bcrypt.genSalt(10);
    const hashedOTP = bcrypt.hash(forgotPasswordOTP, salt);
    console.log(`Hashed OTP: ${hashedOTP}`);
    await User.findOneAndUpdate(
      { email },
      {
        forgotPasswordOTP: hashedOTP,
        // forgotPasswordOTPExpire: Date.now() + 5 * 60 * 1000,
      }
    )
      .then((result) => {
        res.status(200).json({
          success: true,
          // message: `Your OTP is ${forgotPasswordOTP}`,
          result,
        });
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          message: "OTP not saved!",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const JWTTokenGenerator = (id) => {
  return jwt.sign({ id }, process.env.JWT_SIGNATURE);
};
