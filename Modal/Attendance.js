const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  title: String,
  latitude: String,
  longitude: String,
  address: String,
  employ: String,
  range: String,
});

const attendanceSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    branch: [branchSchema],
  },
  { collection: "attendance" },
); // 👈 YE LINE MOST IMPORTANT

module.exports = mongoose.model("Attendance", attendanceSchema);
