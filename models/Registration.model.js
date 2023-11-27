const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

const RegistrationModel = mongoose.model("Registration", RegistrationSchema);

module.exports = RegistrationModel;
