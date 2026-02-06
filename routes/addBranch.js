const express = require("express");
const addBranchRouter = express.Router();
const attendance = require("../Modal/Attendance");

addBranchRouter.get("/", async (req, res) => {
  try {
    console.log("✅ /addBranch called via ngrok");
    console.log("📦 Full request body:", JSON.stringify(req.body, null, 2));

    const { branchForm } = req.body;

    console.log("📝 branchForm received:", branchForm);

    // ✅ Find the specific document by its ID
    // Replace this ID with your actual document ID or get it from the request

    // Or if you want to find the first/main document
    const attendanceDoc = await attendance.findOne();

    if (!attendanceDoc) {
      return res.status(404).json({
        success: false,
        message: "No attendance document found",
      });
    }

    // ✅ Create new branch object
    const newBranch = {
      title: branchForm.title?.trim() || "",
      address: branchForm.address?.trim() || "",
      latitude: branchForm.lat?.trim() || "",
      longitude: branchForm.long?.trim() || "",
      employ: branchForm.employees?.trim() || "",
      range: branchForm.range?.trim() || "",
    };

    console.log("🆕 New branch to add:", newBranch);

    // ✅ Add to branch array
    attendanceDoc.branch.push(newBranch);

    // ✅ Save to database
    const savedData = await attendanceDoc.save();

    console.log(
      `✅ Saved successfully! New total branches: ${savedData.branch.length}`,
    );

    // ✅ Send success response
    res.json({
      success: true,
      message: "Branch added successfully",
      totalBranches: savedData.branch.length,
      newBranch: newBranch,
      documentId: savedData._id,
    });
  } catch (error) {
    console.error("❌ Server error details:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

module.exports = addBranchRouter;
