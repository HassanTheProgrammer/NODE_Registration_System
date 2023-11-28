const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      text,
    });
    res.status(200).json({ success: true, message: "Email send successfully" });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Email not sent",
        error: error.message,
      });
  }
};
