const mongoose = require("mongoose");

const assignedTaskSchema = new mongoose.Schema(
  {
    lightId: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    assignedAt: {
      type: Date, // Date object store karega
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto add hoga
  },
  { collection: "AssignedTask" },
);

const AssignedTask = mongoose.model("AssignedTask", assignedTaskSchema);

module.exports = AssignedTask;
