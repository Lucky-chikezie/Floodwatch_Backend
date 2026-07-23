const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOtpEmail = async (to, otp) => {
  await apiInstance.sendTransacEmail({
    sender: { name: 'FloodWatch', email: process.env.EMAIL_USER },
    to: [{ email: to }],
    subject: 'Your FloodWatch verification code',
    textContent: `Your OTP code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = { sendOtpEmail };