const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

// SIGNUP - creates a student account (registration + login credentials in one)
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, phone, course, year, dob } = req.body;

    if (!fullName || !email || !password || !phone || !course || !year || !dob) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const emailLower = email.toLowerCase();
    const existing = await Student.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      fullName,
      email: emailLower,
      password: hashedPassword,
      phone,
      course,
      year,
      dob
    });
    await student.save();

    // Log the user in immediately after signup
    req.session.studentId = student._id;

    const { password: _pw, ...safeStudent } = student.toObject();
    res.status(201).json({ message: 'Account created successfully!', student: safeStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating account.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    req.session.studentId = student._id;

    const { password: _pw, ...safeStudent } = student.toObject();
    res.json({ message: 'Logged in successfully!', student: safeStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully!' });
  });
});

// CURRENT USER - used by the frontend to check if logged in
router.get('/me', async (req, res) => {
  if (!req.session.studentId) {
    return res.status(401).json({ message: 'Not logged in.' });
  }
  try {
    const student = await Student.findById(req.session.studentId).select('-password');
    if (!student) {
      return res.status(401).json({ message: 'Not logged in.' });
    }
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
