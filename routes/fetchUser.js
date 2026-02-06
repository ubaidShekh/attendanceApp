const express = require("express");
const fetchUserRouter = express.Router();
const User = require("../Modal/User");

fetchUserRouter.get("/", async (req, res) => {
  console.log("fetch user");
  const data = await User.find();
  res.json(data);
});

module.exports = fetchUserRouter;
