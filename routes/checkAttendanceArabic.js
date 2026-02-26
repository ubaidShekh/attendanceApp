// routes/chckAttendance.js
const express = require("express");
const checkAttendanceArabicrouter = express.Router();
const CheckAttendanceArabic = require("../Modal/CheckAttendanceArabic");

// POST - Save attendance
checkAttendanceArabicrouter.post("/", async (req, res) => {
  console.log("=".repeat(50));
  console.log("📱 POST /sendAttendanceArabic received");
  console.log("📦 Request Body:", req.body);

  try {
    if (!req.body) {
      console.log("❌ Error: No request body");
      return res.status(400).json({
        success: false,
        message: "No data received in request body",
      });
    }

    const { employeeId, name, time, date, punchType, image } = req.body;

    // Validate required fields
    if (!employeeId || !name || !time || !date || !punchType || !image) {
      console.log("❌ Error: Missing required fields");
      console.log("Received:", {
        employeeId,
        name,
        time,
        date,
        punchType,
        image,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["employeeId", "name", "time", "date", "punchType", "image"],
        received: req.body,
      });
    }

    console.log("✅ Validated data successfully");

    // Create new attendance record
    const attendance = new CheckAttendanceArabic({
      employeeId,
      name,
      time,
      date,
      punchType,
      image,
    });

    console.log("💾 Saving to database...");
    await attendance.save();
    console.log("✅ Saved to database. ID:", attendance._id);

    res.json({
      success: true,
      message: "Attendance saved successfully",
      data: {
        id: attendance._id,
        employeeId: attendance.employeeId,
        name: attendance.name,
        time: attendance.time,
        date: attendance.date,
        punchType: attendance.punchType,
        createdAt: attendance.createdAt,
        image: attendance.image,
      },
    });

    console.log("📤 Response sent successfully");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    console.error("Error Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Error saving attendance to database",
      error: error.message,
    });
  }
});

// GET - Get all attendance (for testing)
checkAttendanceArabicrouter.get("/", async (req, res) => {
  try {
    console.log("📡 GET /sendAttendanceArabic received");

    const attendance = await CheckAttendanceArabic.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
      message: "Latest 10 attendance records",
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
    });
  }
});

// GET - Get today's attendance
checkAttendanceArabicrouter.get("/today", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    console.log("📅 Fetching today's attendance:", today);

    const attendance = await CheckAttendanceArabic.find({ date: today }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      date: today,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching today's attendance",
    });
  }
});

// GET - Get attendance by employee ID
checkAttendanceArabicrouter.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log("👤 Fetching attendance for employee:", employeeId);

    const attendance = await CheckAttendance.find({ employeeId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      employeeId,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee attendance",
    });
  }
});

module.exports = checkAttendanceArabicrouter;
