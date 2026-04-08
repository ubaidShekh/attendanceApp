const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    EmployeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameArabic: { type: String },
    designation: { type: String, required: true },
    designationArabic: { type: String },
    department: { type: String, required: true },
    departmentArabic: { type: String },
    branch: { type: String, required: true },
    branchArabic: { type: String },
    salary: { type: String, required: true },
    salaryArabic: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
); // adds createdAt & updatedAt automatically

module.exports = mongoose.model("addEmployee", employeeSchema);
