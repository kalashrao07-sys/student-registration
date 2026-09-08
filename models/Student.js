const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    dob: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
