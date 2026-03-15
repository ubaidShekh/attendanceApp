const express = require("express");
const checkAttendancerouter = express.Router();
const CheckAttendance = require("../Modal/CheckAttendance");

// ---------- Helper: convert "hh:mm AM/PM" or "HH:mm" to minutes since midnight ----------
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  // try 12-hour format with AM/PM
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  // try 24-hour format "HH:mm"
  const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  return 0; // fallback
}

// ---------- Helper: get previous date string in "MM/DD/YYYY" (assuming US locale) ----------
function getPreviousDateString(dateStr, daysAgo) {
  // dateStr format: "MM/DD/YYYY"
  const [month, day, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  date.setDate(date.getDate() - daysAgo);
  const prevMonth = String(date.getMonth() + 1).padStart(2, "0");
  const prevDay = String(date.getDate()).padStart(2, "0");
  const prevYear = date.getFullYear();
  return `${prevMonth}/${prevDay}/${prevYear}`;
}

// POST - Save attendance
checkAttendancerouter.post("/", async (req, res) => {
  console.log("=".repeat(50));
  console.log("📱 POST /sendAttendance received");
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
    if (!employeeId || !name || !time || !date || !punchType) {
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

    // ---------- NEW LOGIC: Consecutive late days → absent on third day ----------
    let dayStatus = "present"; // default

    if (punchType === "IN") {
      // 1. Check if this is the first IN of the day for this employee
      const existingInCount = await CheckAttendance.countDocuments({
        employeeId,
        date,
        punchType: "IN",
      });

      const isFirstIn = existingInCount === 0;

      if (isFirstIn) {
        console.log(`🔍 First IN of the day for employee ${employeeId}`);

        // 2. Determine if current punch is late (after 9:15 AM)
        const currentMinutes = parseTimeToMinutes(time);
        const cutoff = 9 * 60 + 15; // 9:15 = 555 minutes

        if (currentMinutes > cutoff) {
          // Current punch is late → temporarily mark as late
          dayStatus = "late";
          console.log(`⏰ Current IN is late (${time})`);

          // 3. Check previous two days for consecutive lateness
          const yesterday = getPreviousDateString(date, 1);
          const dayBeforeYesterday = getPreviousDateString(date, 2);

          console.log(
            `📅 Checking previous days: ${yesterday}, ${dayBeforeYesterday}`,
          );

          // Helper to get first IN of a given date and check if it was late
          const wasLateOnDate = async (targetDate) => {
            const records = await CheckAttendance.find({
              employeeId,
              date: targetDate,
              punchType: "IN",
            }).sort({ createdAt: 1 }); // earliest first
            if (records.length === 0) return false; // no IN on that day
            const firstIn = records[0];
            const mins = parseTimeToMinutes(firstIn.time);
            return mins > cutoff;
          };

          const wasLateYesterday = await wasLateOnDate(yesterday);
          const wasLateDayBefore = await wasLateOnDate(dayBeforeYesterday);

          console.log(
            `📊 Was late yesterday: ${wasLateYesterday}, day before: ${wasLateDayBefore}`,
          );

          if (wasLateYesterday && wasLateDayBefore) {
            // Three consecutive late days (including today) → mark today as ABSENT
            dayStatus = "absent";
            console.log(
              "🚨 THREE CONSECUTIVE LATE DAYS! Marking today as ABSENT.",
            );
          } else {
            console.log("✅ Not three consecutive late days. Keeping as late.");
          }
        } else {
          console.log(`✅ First IN is on time (${time}) – status: present`);
        }
      } else {
        console.log(
          "⏩ Not the first IN of the day – skipping late/absent logic.",
        );
      }
    } else {
      console.log("⏩ OUT punch – no late/absent logic applied.");
    }

    // Create new attendance record (with dayStatus)
    const attendance = new CheckAttendance({
      employeeId,
      name,
      time,
      date,
      punchType,
      image,
      dayStatus, // <-- new field
    });

    console.log("💾 Saving to database with dayStatus:", dayStatus);
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
        dayStatus: attendance.dayStatus, // included in response
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
checkAttendancerouter.get("/", async (req, res) => {
  try {
    console.log("📡 GET /sendAttendance received");

    const attendance = await CheckAttendance.find().sort({ createdAt: -1 });

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
checkAttendancerouter.get("/today", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    console.log("📅 Fetching today's attendance:", today);

    const attendance = await CheckAttendance.find({ date: today }).sort({
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
checkAttendancerouter.get("/employee/:employeeId", async (req, res) => {
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

module.exports = checkAttendancerouter;
