var express = require("express");
var router = express.Router();
const Attendance = require("../Modal/Attendance");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  // res.send("respond with a resource");
  const data = await Attendance.find();
  res.json(data);
});

module.exports = router;
