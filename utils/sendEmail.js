const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async ({ companyName, email, subject, message }) => {
  await nodemailer
    .createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.USER,
        pass: process.env.USER_PASSWORD,
      },
    })
    .sendMail(
      {
        from: `${companyName} <${process.env.USER}>`,
        to: email,
        subject: subject,
        text: message,
      },
      (error, result) => {
        if (error) {
          console.log(`Failed to send OTP\n${error}`);
        }
        if (result) {
          // console.log("OTP send successfully\n", result);
          console.log("OTP send successfully");
        }
      }
    );
};

module.exports = sendMail;
