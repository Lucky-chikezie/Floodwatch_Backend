const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try signing up again.' });
    }

    res.status(201).json({
      message: 'Signup successful. Please verify your email with the OTP sent.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};