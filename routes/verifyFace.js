const express = require("express");
const router = express.Router();
const User = require("../Modal/User");
const axios = require("axios");
const FormData = require("form-data");

// Python face comparison endpoint
const PYTHON_API_URL = "https://5qbfjszb-8080.inc1.devtunnels.ms/compare-face";

router.post("/", async (req, res) => {
  try {
    console.log("📥 /verify-face called");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("employeeId:", req.body.employeeId);
    console.log("capturedImage present:", !!req.body.capturedImage);
    console.log("capturedImage length:", req.body.capturedImage?.length);

    const { employeeId, capturedImage } = req.body;

    if (!employeeId || !capturedImage) {
      console.log("❌ Missing fields");
      return res
        .status(400)
        .json({ error: "employeeId and capturedImage are required" });
    }

    const user = await User.findOne({ employeeId });
    if (!user) {
      console.log("❌ User not found for employeeId:", employeeId);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.image) {
      console.log("❌ User has no stored image");
      return res
        .status(400)
        .json({ error: "User has no registered face image" });
    }

    console.log("✅ User found, stored image length:", user.image.length);

    // Convert base64 to buffers safely
    let storedImageBuffer, capturedImageBuffer;
    try {
      storedImageBuffer = Buffer.from(user.image, "base64");
      capturedImageBuffer = Buffer.from(capturedImage, "base64");
    } catch (bufferError) {
      console.error("❌ Buffer conversion failed:", bufferError.message);
      return res.status(400).json({ error: "Invalid base64 image data" });
    }

    console.log(
      "Image buffer sizes - stored:",
      storedImageBuffer.length,
      "captured:",
      capturedImageBuffer.length,
    );

    // Prepare form data for Python API
    const formData = new FormData();
    formData.append("image1", storedImageBuffer, {
      filename: "stored.jpg",
      contentType: "image/jpeg",
    });
    formData.append("image2", capturedImageBuffer, {
      filename: "captured.jpg",
      contentType: "image/jpeg",
    });

    // Call Python API with required headers to bypass ngrok warning
    console.log("⏳ Calling Python API at:", PYTHON_API_URL);
    const startTime = Date.now();

    const response = await axios.post(PYTHON_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        // 🔥 Critical: Add this header to skip ngrok browser warning
        "ngrok-skip-browser-warning": "true",
        // Also set a common browser user-agent for good measure
        "User-Agent": "Mozilla/5.0 (compatible; Node.js/axios)",
      },
      timeout: 15000,
    });

    const endTime = Date.now();
    console.log(`✅ Python API responded in ${endTime - startTime}ms`);
    console.log("Python API response data:", response.data);

    // Check if the response contains an error from the Python API itself
    if (response.data.error) {
      console.log("⚠️ Python API returned an error:", response.data.error);
      // 🔥 Important: Return a successful response with match: false and the error message
      return res.json({
        match: false,
        error: response.data.error, // Forward the error to the frontend
      });
    }

    // If no error, return the match result
    return res.json({
      match: response.data.match || false,
    });
  } catch (error) {
    console.error("❌ FACE VERIFICATION ERROR - FULL DETAILS:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.response) {
      console.error("Python API response status:", error.response.status);
      console.error(
        "Python API response data (first 200 chars):",
        JSON.stringify(error.response.data).substring(0, 200),
      );
    } else if (error.request) {
      console.error("No response received from Python API");
    } else {
      console.error("Error setting up request:", error.message);
    }

    if (error.code === "ECONNABORTED") {
      return res
        .status(504)
        .json({ error: "Face recognition service timeout" });
    }
    if (error.code === "ECONNREFUSED") {
      return res
        .status(502)
        .json({ error: "Face recognition service unreachable" });
    }

    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

module.exports = router;
