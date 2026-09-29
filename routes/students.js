const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const requireAuth = require('../middleware/requireAuth');

// All routes below require login
router.use(requireAuth);

// READ - Get all students (password never included)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching students.' });
  }
});

// READ - Get one student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// UPDATE - a student can only edit their own profile
router.put('/:id', async (req, res) => {
  try {
    if (req.params.id !== req.session.studentId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own profile.' });
    }

    const { fullName, email, phone, course, year, dob } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...(fullName && { fullName }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(course && { course }),
        ...(year && { year }),
        ...(dob && { dob })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Profile updated successfully!', student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating student.' });
  }
});

// DELETE - a student can only delete their own account
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id !== req.session.studentId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own account.' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Account deleted successfully!' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting student.' });
  }
});

module.exports = router;
