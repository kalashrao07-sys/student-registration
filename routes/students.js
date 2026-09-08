const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// CREATE - Register a new student
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, course, year, dob } = req.body;

    if (!fullName || !email || !phone || !course || !year || !dob) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A student with this email is already registered.' });
    }

    const student = new Student({ fullName, email, phone, course, year, dob });
    await student.save();

    res.status(201).json({ message: 'Student registered successfully!', student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering student.' });
  }
});

// READ - Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching students.' });
  }
});

// READ - Get one student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// UPDATE - Edit a student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student updated successfully!', student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating student.' });
  }
});

// DELETE - Remove a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting student.' });
  }
});

module.exports = router;
