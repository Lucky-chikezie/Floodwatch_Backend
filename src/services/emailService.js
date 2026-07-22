const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"FloodWatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your FloodWatch verification code',
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = { sendOtpEmail };