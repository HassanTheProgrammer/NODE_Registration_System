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
      const isExistEamil = await User.findOne({ email });
      if (isExistEamil) {
        return res.status(400).json({
          success: false,
          message: "user with this email already exists",
        });
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
          try {
            const user = await User.create({
              fullName,
              cnic,
              email,
              password: hash,
              image: req.file.path,
            });
            const jwtToken = handleGenerateJWTToken(user._id);
            res.status(200).json({
              success: true,
              message: "User Registered Successfully",
              jwtToken,
            });
          } catch (error) {
            res.status(400).json({
              success: false,
              error: error.message,
            });
          }
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

      const jwtToken = handleGenerateJWTToken(user._id);
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
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(forgotPasswordOTP, salt);
    await User.findOneAndUpdate(
      { email },
      {
        forgotPasswordOTP: hashedOTP,
        forgotPasswordOTPExpire: Date.now() + 5 * 60 * 1000,
      }
    )
      .then((result) => {
        res.status(200).json({
          success: true,
          message: `Your OTP is ${forgotPasswordOTP}`,
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

/**
 * handleOTPVarification
 */
exports.handleOTPVarification = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      forgotPasswordOTPExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP has been expired",
      });
    }
    const isValidOTP = await bcrypt.compare(otp, user.forgotPasswordOTP);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Wrong OTP",
      });
    }

    try {
      await User.findOneAndUpdate(
        { email },
        {
          setNewPassword: true,
          forgotPasswordOTP: "",
        }
      );
      res.status(200).json({
        success: true,
        message: "OTP Varified Successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * handleResetPassword
 */
exports.handleResetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;
    if (!newPassword || !confirmNewPassword) {
      res.status(400).json({
        success: false,
        message: "required empty fields",
      });
    }
    email?.toLowerCase();

    const isUser = await User.findOne({ email });

    if (!isUser.setNewPassword) {
      res.status(400).json({
        success: false,
        message: "you are not allowed to do that",
      });
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({
        success: false,
        message: "password and confirm password don't match",
      });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.findOneAndUpdate(
        { email },
        {
          password: hashedPassword,
          setNewPassword: false,
        }
      );
      return res.status(200).json({
        success: true,
        message: "new password successfully updated",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "error during update password in DB",
        errorMessage: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: isUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Handle Reset Password - catch Error",
      errorMessage: error.message,
    });
  }
};
/**
 * handleGenerateJWTToken
 */
const handleGenerateJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SIGNATURE);
};
