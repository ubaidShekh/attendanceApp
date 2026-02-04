const express = require("express");
const User = require("../Modal/User");
const Attendance = require("../Modal/Attendance");

const totalEmployRouter = express.Router();

totalEmployRouter.get("/", async (req, res) => {
  const user = await User.find();
  const attendance = await Attendance.find();
  const number = attendance.map((item) => {
    return item.branch.length;
  });

  res.json({ totalemploy: user.length, branch: number });
});

module.exports = totalEmployRouter;
