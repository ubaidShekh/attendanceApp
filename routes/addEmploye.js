const express = require("express");
const Employee = require("../Modal/addEmploye");

const addEmployerouter = express.Router();

// POST /addEmploye
addEmployerouter.post("/", async (req, res) => {
  try {
    console.log("✅ /addEmploye called via ngrok");
    console.log("📦 Full request body:", JSON.stringify(req.body, null, 2));

    // Extract fields from request bodyy
    const {
      name,
      nameArabic,
      designation,
      designationArabic,
      department,
      departmentArabic,
      branch,
      branchArabic,
      salary,
      salaryArabic,
      status,
    } = req.body;

    // Basic validation
    if (!name || !designation || !department || !branch || !salary) {
      return res.status(400).json({
        error:
          "Missing required fields: name, designation, department, branch, salary",
      });
    }

    // Create new employee document
    const newEmployee = new Employee({
      name,
      nameArabic,
      designation,
      designationArabic,
      department,
      departmentArabic,
      branch,
      branchArabic,
      salary: Number(salary), // ensure numeric
      salaryArabic,
      status,
    });

    // Save to MongoDB
    const savedEmployee = await newEmployee.save();

    res.status(201).json({
      message: "Employee added successfully",
      employee: savedEmployee,
    });
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = addEmployerouter;
