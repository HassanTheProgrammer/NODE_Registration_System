const mongoose = require("mongoose");

const userRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      requried: true,
    },
    forgotPasswordOTP: {
      type: String,
    },
    // forgotPasswordOTPExpire: Number,
  },
  { timestamps: true }
);

const userRegistrationModel = mongoose.model(
  "Registration",
  userRegistrationSchema
);

module.exports = userRegistrationModel;
