const express = require("express");
const router = express.Router();
const User = require("../Modal/User");
const axios = require("axios");
const FormData = require("form-data");

// Python face comparison endpoint
const PYTHON_API_URL = "https://4588-42-111-123-7.ngrok-free.app/compare-face";

router.post("/", async (req, res) => {
  try {
    const { employeeId, capturedImage } = req.body;

    if (!employeeId || !capturedImage) {
      return res
        .status(400)
        .json({ error: "employeeId and capturedImage are required" });
    }

    // Find user by employeeId
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.image) {
      return res
        .status(400)
        .json({ error: "User has no registered face image" });
    }

    // Prepare form data for Python API
    const formData = new FormData();

    // Convert base64 strings to buffers and append as files
    const storedImageBuffer = Buffer.from(user.image, "base64");
    const capturedImageBuffer = Buffer.from(capturedImage, "base64");

    formData.append("image1", storedImageBuffer, {
      filename: "stored.jpg",
      contentType: "image/jpeg",
    });
    formData.append("image2", capturedImageBuffer, {
      filename: "captured.jpg",
      contentType: "image/jpeg",
    });

    // Call Python API
    const response = await axios.post(PYTHON_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Python API returns { match: boolean } or { match: boolean, error: string }
    const { match, error } = response.data;

    if (error) {
      return res
        .status(500)
        .json({ error: "Face recognition error: " + error });
    }

    return res.json({ match });
  } catch (error) {
    console.error("Face verification error:", error.message);
    if (error.code === "ECONNABORTED") {
      return res
        .status(504)
        .json({ error: "Face recognition service timeout" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
