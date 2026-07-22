const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  await resend.emails.send({
    from: 'FloodWatch <onboarding@resend.dev>',
    to,
    subject: 'Your FloodWatch verification code',
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = { sendOtpEmail };