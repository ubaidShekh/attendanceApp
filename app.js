if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var createuserRouter = require("./routes/createuser");
var loginRouter = require("./routes/login");
var checkAttendancerouter = require("./routes/chckAttendance");
const User = require("./Modal/User");
const Attendance = require("./routes/attendance");
const mongoose = require("mongoose");
const totalEmployRouter = require("./routes/totalemplot");
var cors = require("cors");
const attendance = require("./Modal/CheckAttendance");
const { isDataView } = require("util/types");

var app = express();

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/register", createuserRouter);
app.use("/login", loginRouter);
app.use("/attendance", Attendance);
app.use("/sendAttendance", checkAttendancerouter);
app.use("/totalemploy", totalEmployRouter);
app.post("/addBranch", async (req, res) => {
  try {
    console.log("✅ /addBranch called via ngrok");
    console.log("📦 Full request body:", JSON.stringify(req.body, null, 2));

    const { branchForm } = req.body;

    if (!branchForm) {
      console.log("❌ No branchForm in request");
      return res.status(400).json({
        success: false,
        message: "branchForm data is required in request body",
      });
    }

    console.log("📝 branchForm received:", branchForm);

    // ✅ 1. First check if attendance model exists
    if (!attendance) {
      console.log("❌ Attendance model not imported properly");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // ✅ 2. Find the NCC document - try multiple ways
    let attendanceDoc;

    // Try by ID first
    attendanceDoc = await attendance.findById("69819ec07efb75719f58565c");

    // If not found by ID, try by title
    if (!attendanceDoc) {
      attendanceDoc = await attendance.findOne({ title: "NCC" });
    }

    // If still not found, get first document
    if (!attendanceDoc) {
      attendanceDoc = await attendance.findOne();
    }

    if (!attendanceDoc) {
      console.log("❌ No document found in database");
      return res.status(404).json({
        success: false,
        message: "No document found in database. Please create one first.",
        suggestion: "Create a document with title 'NCC' first",
      });
    }

    console.log("✅ Document found:");
    console.log("   ID:", attendanceDoc._id);
    console.log("   Title:", attendanceDoc.title);
    console.log("   Branch field exists:", attendanceDoc.branch !== undefined);
    console.log("   Branch is array:", Array.isArray(attendanceDoc.branch));

    // ✅ 3. Ensure branch array exists
    if (!attendanceDoc.branch) {
      console.log("⚠️ Branch field doesn't exist, creating it...");
      attendanceDoc.branch = [];
    } else if (!Array.isArray(attendanceDoc.branch)) {
      console.log("⚠️ Branch is not an array, converting...");
      attendanceDoc.branch = [attendanceDoc.branch];
    }

    console.log(`📊 Current branches count: ${attendanceDoc.branch.length}`);

    // ✅ 4. Create new branch object
    const newBranch = {
      title: branchForm.title?.trim() || "",
      address: branchForm.address?.trim() || "",
      latitude: branchForm.lat?.trim() || "",
      longitude: branchForm.long?.trim() || "",
      employ: branchForm.employees?.trim() || "",
      range: branchForm.range?.trim() || "",
    };

    console.log("🆕 New branch to add:", newBranch);

    // ✅ 5. Add to branch array
    attendanceDoc.branch.push(newBranch);

    // ✅ 6. Save to database
    const savedData = await attendanceDoc.save();

    console.log(
      `✅ Saved successfully! New total branches: ${savedData.branch.length}`,
    );

    // ✅ 7. Send success response
    res.json({
      success: true,
      message: "Branch added successfully",
      totalBranches: savedData.branch.length,
      newBranch: newBranch,
      documentId: savedData._id,
    });
  } catch (error) {
    console.error("❌ Server error details:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error line number:", error.lineNumber);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});
module.exports = app;
