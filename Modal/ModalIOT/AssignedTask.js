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
    email: {
      type: String,
      required: true,
      default: "ubaidjmi2022@gmail.com",
      lowercase: true,
      trim: true,
    },
    voltage: {
      type: Number,
      required: true,
      default: 5, // street light typical AC
    },
    current: {
      type: Number,
      required: true,
      default: 0.5, // ampere (example)
    },
    status: {
      type: String,
      enum: ["In Progress", "Working", "Fault", "Offline"],
      default: "Offline",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    assignedAt: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "assignedtasks",
  },
);

const AssignedTask = mongoose.model("AssignedTask", assignedTaskSchema);

module.exports = AssignedTask;
