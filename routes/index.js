var express = require("express");
var router = express.Router();
const Attendance = require("../Modal/Attendance");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const branch = await Attendance.find();
  if (branch) {
    res.json({ data: branch, name: "hii" });
  } else {
    res.json({ data: "data not found" });
  }
  //res.json({ data: branch, name: "hii" });
  //res.render("index", { title: "Express" });
});

module.exports = router;
