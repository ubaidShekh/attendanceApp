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
const addEmployModel = require("./Modal/addEmploye");

//clicker
const clicker = require("./routes/clicker/clicker")


//IOT import
const UserIOT = require("./routes/routesIOT/UserIOT");
const AssignedTaskRouter = require("./routes/routesIOT/AssignedTask");
const asignedTask = require("./Modal/ModalIOT/AssignedTask");
const userIOT = require("./Modal/ModalIOT/UserIOT");

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

//clicker

app.use("/clicker",clicker);
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
  try{
    const employee = await addEmployModel.findOne({ EmployeeId: EmployeeId });
    if (employee) {
      console.log("✅ Employee found:", employee);
      res.json({ status: true, employee });
    } else {
      console.log("❌ Employee not found with EmployeeId:", EmployeeId);
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking employee:", error);
    res.status(500).json({ exists: false, error: error.message });
  }
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

    if (task.status === "In Progress") {
      newStatus = "Working";
    } else if (task.status === "Fault" || task.status === "Offline") {
      newStatus = "In Progress";
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
// Add this to your main server file (e.g., server.js or app.js)

app.use("/iot/addlight", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { lightId, location, status, voltage, current } = req.body;

    // Validation
    if (!lightId || !location) {
      return res.status(400).json({
        success: false,
        message: "Light ID and Location are required",
      });
    }

    // Check if light already exists
    const existingLight = await asignedTask.findOne({ lightId: lightId });
    if (existingLight) {
      return res.status(409).json({
        success: false,
        message: `Light with ID ${lightId} already exists`,
      });
    }

    // Create new light document
    const newLight = new asignedTask({
      lightId: lightId,
      location: location,
      email: "ubaidjmi2022@gmail.com", // Default email as per schema
      voltage: status === "Working" ? voltage || 220 : 0,
      current: status === "Working" ? current || 1.5 : 0,
      status:
        status === "Working"
          ? "Working"
          : status === "Fault"
            ? "Fault"
            : "Offline",
      priority: "Medium", // Default priority
      assignedAt: new Date(),
      description: `Light ${lightId} installed at ${location}`,
    });

    // Save to database
    const savedLight = await newLight.save();

    console.log("Light added successfully:", savedLight);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Light added successfully",
      data: {
        lightId: savedLight.lightId,
        location: savedLight.location,
        status: savedLight.status,
        voltage: savedLight.voltage,
        current: savedLight.current,
        assignedAt: savedLight.assignedAt,
      },
    });
  } catch (error) {
    console.error("Error adding light:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
app.use("/iot/fetchAsupervisor", async (req, res) => {
const user = await userIOT.findOne();
res.json(user);
});
// Update Light API Endpoint
app.use("/iot/save-light", async (req, res) => {
  try {
    const { id, location, voltage, current, status, priority, description } = req.body;
    
    // Validate required fields
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Light ID is required" 
      });
    }
    
    // Find and update the light
    const updatedLight = await asignedTask.findOneAndUpdate(
      { lightId: id },  // Find by lightId field
      { 
       location: location, 
        voltage: voltage, 
        current: current, 
        status: status, 
        priority: priority, 
        description: description,
        updatedAt: new Date()  // Update timestamp
      },
      { new: true }  // Return updated document
    );
    
    // Check if light exists
    if (!updatedLight) {
      return res.status(404).json({ 
        success: false, 
        message: "Light not found" 
      });
    }
    
     console.log("Light updated successfully:", updatedLight);
    // Send success response
    res.status(200).json({
      success: true,
      message: "Light updated successfully",
      data: updatedLight
    });
   
    
  } catch (error) {
    console.error("Error updating light:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});
// Delete Light API Endpoint
app.use("/iot/delete-light", async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id)
    
    // Validate required fields
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Light ID is required" 
      });
    }
    
    // Find and delete the light
    const deletedLight = await asignedTask.findOneAndDelete({ lightId: id });
    
    // Check if light exists
    if (!deletedLight) {
      return res.status(404).json({ 
        success: false, 
        message: "Light not found" 
      });
    }
    
    console.log("Light deleted successfully:", deletedLight);
    
    // Send success response
    res.status(200).json({
      success: true,
      message: "Light deleted successfully",
      data: deletedLight
    });
    
  } catch (error) {
    console.error("Error deleting light:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});
module.exports = app;
