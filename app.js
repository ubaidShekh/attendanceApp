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
var app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log("server is runing");
  const mongodburl =
    "mongodb+srv://ubaidjmi202:12345678ubaidjmi202@cluster0.g9k3jpw.mongodb.net/?appName=Cluster0";
  // Connect to MongoDB Atlas
  mongoose
    .connect(mongodburl)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
});
