const nodmailer = require('nodemailer');

const transporter = nodmailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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