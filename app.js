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
const Attendance = require("./routes/attendance");
const addBranchRouter = require("./routes/addBranch");
const mongoose = require("mongoose");
const totalEmployRouter = require("./routes/totalemplot");
const fetchUserRouter = require("./routes/fetchUser");
const allAtendanceRouter = require("./routes/allAtendance");
var cors = require("cors");
const { isDataView } = require("util/types");
const attendanceArabicRouter = require("./routes/AttendanceArabic");
const CheckAttendanceArabic = require("./routes/checkAttendanceArabic");
const verifyFaceRouter = require("./routes/verifyFace");
const addEmploye = require("./routes/addEmploye");

//IOT import
const UserIOT = require("./routes/routesIOT/UserIOT");
const AssignedTaskRouter = require("./routes/routesIOT/AssignedTask");
const asignedTask = require("./Modal/ModalIOT/AssignedTask");

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/register", createuserRouter);
app.use("/login", loginRouter);
app.use("/attendance", Attendance);
app.use("/sendAttendance", checkAttendancerouter);
app.use("/totalemploy", totalEmployRouter);
app.use("/addBranch", addBranchRouter);

app.use("/fetchuser", fetchUserRouter);
app.use("/allAtendance", allAtendanceRouter);
//arabic version
app.use("/attendanceArabic", attendanceArabicRouter);
app.use("/sendAttendanceArabic", CheckAttendanceArabic);
app.use("/verify-face", verifyFaceRouter);
app.use("/addEmploye", addEmploye);
app.use("/checkEmployee", async (req, res) => {
  const { EmployeeId } = req.body;
  console.log("🔍 Checking EmployeeId:", EmployeeId);
});

//IOT APP
app.use("/iot/createuser", UserIOT);
app.use("/iot/login", require("./routes/routesIOT/LoginIOT"));
app.use("/iot/assignedtasks", AssignedTaskRouter);
app.use("/iot/changetaskstatus", async (req, res) => {
  try {
    const { id } = req.body;

    // 🔍 Step 1: Find task
    const task = await asignedTask.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔄 Step 2: Status logic
    let newStatus = task.status;
    let priority = task.priority;

    if (task.status === "Pending") {
      newStatus = "In Progress";
    } else if (task.status === "In Progress") {
      newStatus = "Completed";
      priority = "Low"; // Automatically set to Low when completed
      task.priority = priority;
    }

    // 📝 Step 3: Update
    task.status = newStatus;
    await task.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: task,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
});
app.use("/iot/alllights", async (req, res) => {
  console.log("request for get task");
  const task = await asignedTask.find();
  res.json(task);
  console.log(task);
});
app.use("/iot/sendupdatedtask", async (req, res) => {
  try {
    console.log("REQUEST FOR UPDATE TASK");
    console.log(req.body);

    const { lightId, voltage, current, status } = req.body;

    // validation
    if (!lightId) {
      return res.status(400).json({
        success: false,
        message: "lightId is required",
      });
    }

    // find and update
    const updatedTask = await asignedTask.findOneAndUpdate(
      { lightId: lightId }, // find by lightId
      {
        voltage: voltage,
        current: current,
        status: status,
      },
      {
        new: true, // updated data return karega
      },
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Light not found",
      });
    }
    console.log("Updated Task:", updatedTask);
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = app;
