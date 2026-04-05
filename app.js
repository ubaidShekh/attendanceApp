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
module.exports = app;
