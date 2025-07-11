const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"MedPro" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>This will expire in 5 minutes.</p>`
  });
};
