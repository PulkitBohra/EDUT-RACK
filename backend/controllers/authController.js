const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount >= 3) return res.status(400).json({ message: 'Admin limit reached' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullname, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '3d' }
    );

    res.status(200).json({
      token,
      user: { fullname: user.fullname, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { signup, login };
