const express = require("express");
const createuserRouter = express.Router();
const User = require("../Modal/User");

createuserRouter.post("/", async (req, res) => {
  try {
    console.log("received request");
    const { name, employeeId, email, number, password, image } = req.body;
    console.log(`name: ${name},
            employeeId: ${employeeId},
            email: ${email},
            number: ${number},
            password: ${password},
            image: ${image ? "provided" : "not provided"}`);

    const myformData = new User({
      fullName: name,
      employeeId: employeeId,
      email: email,
      phone: number,
      password: password,
      image: image, // store base64
    });

    await myformData.save();
    console.log("data saved");
    res.json({ body: "we have received your request", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = createuserRouter;
