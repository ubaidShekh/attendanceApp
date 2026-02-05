const express = require("express");
const User = require("../Modal/User");
const Attendance = require("../Modal/Attendance");
const CheckAttendance = require("../Modal/CheckAttendance");

const totalEmployRouter = express.Router();

totalEmployRouter.get("/", async (req, res) => {
  const user = await User.find();
  const attendance = await Attendance.find();
  const today = new Date();
  const todayFormatted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  const todaysPunch = await CheckAttendance.find({ date: todayFormatted });

  const number = attendance.map((item) => {
    return item.branch.length;
  });

  res.json({
    totalemploy: user.length,
    branch: number,
    todayspunch: todaysPunch.length / 2,
  });
});

module.exports = totalEmployRouter;
