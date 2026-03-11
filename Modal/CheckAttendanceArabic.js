// Modal/CheckAttendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  punchType: {
    type: String,
    enum: ["IN", "OUT"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: { type: String },
});

const CheckAttendanceArabic = mongoose.model(
  "CheckAttendanceArabic",
  attendanceSchema,
);

module.exports = CheckAttendanceArabic;
