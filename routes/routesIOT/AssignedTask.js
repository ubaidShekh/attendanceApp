const express = require("express");
const Taskrouter = express.Router();
const AssignedTask = require("../../Modal/ModalIOT/AssignedTask");

// GET /api/tasks - सभी assigned tasks fetch करें
Taskrouter.get("/", async (req, res) => {
  try {
    // सारे tasks लाएँ, assignedAt के हिसाब से नया से पुराना
    const tasks = await AssignedTask.find().sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Server error, could not fetch tasks",
    });
  }
});

module.exports = Taskrouter;
