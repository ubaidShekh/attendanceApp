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
  // NEW field for attendance status
  dayStatus: {
    type: String,
    enum: ["present", "late", "absent"],
    default: "present",
  },
});

const CheckAttendance = mongoose.model("CheckAttendance", attendanceSchema);

module.exports = CheckAttendance;
