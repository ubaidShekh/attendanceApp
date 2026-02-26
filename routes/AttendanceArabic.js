const express = require("express");
const Attendance = require("../Modal/AttendanceArabic");

const attendanceArabicRouter = express.Router();

attendanceArabicRouter.get("/", async (req, res) => {
  const data = await Attendance.find();
  if (!data) {
    return;
  }
  try {
    return res.json({ data: data });

    // Return success response
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

module.exports = attendanceArabicRouter;
