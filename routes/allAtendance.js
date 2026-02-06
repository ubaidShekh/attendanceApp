// routes/chckAttendance.js
const express = require("express");
const allAtendanceRouter = express.Router();
const CheckAttendance = require("../Modal/CheckAttendance");

// GET - Get all attendance (for testing)
allAtendanceRouter.get("/", async (req, res) => {
  try {
    console.log("📡 GET /sendAttendance received");

    const attendance = await CheckAttendance.find();

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
      message: "All attendance records",
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
    });
  }
});

module.exports = allAtendanceRouter;
