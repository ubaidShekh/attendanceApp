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
const attendance = require("./Modal/Attendance");
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

    console.log("📝 branchForm received:", branchForm);

    // ✅ Find the specific document by its ID
    // Replace this ID with your actual document ID or get it from the request

    // Or if you want to find the first/main document
    const attendanceDoc = await attendance.findOne();

    if (!attendanceDoc) {
      return res.status(404).json({
        success: false,
        message: "No attendance document found",
      });
    }

    // ✅ Create new branch object
    const newBranch = {
      title: branchForm.title?.trim() || "",
      address: branchForm.address?.trim() || "",
      latitude: branchForm.lat?.trim() || "",
      longitude: branchForm.long?.trim() || "",
      employ: branchForm.employees?.trim() || "",
      range: branchForm.range?.trim() || "",
    };

    console.log("🆕 New branch to add:", newBranch);

    // ✅ Add to branch array
    attendanceDoc.branch.push(newBranch);

    // ✅ Save to database
    const savedData = await attendanceDoc.save();

    console.log(
      `✅ Saved successfully! New total branches: ${savedData.branch.length}`,
    );

    // ✅ Send success response
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
