const express = require("express");
const createuserRouter = express.Router();
const User = require("../Modal/User");
createuserRouter.post("/", async (req, res) => {
  try {
    console.log("recieved request");
    const { name, employeeId, email, number, password } = req.body;
    console.log(`name: ${name},
            employeeId: ${employeeId},
            email: ${email},
            number: ${number},
            password: ${password},`);

    const myformData = new User({
      fullName: name,
      employeeId: employeeId,
      email: email,
      phone: number,
      password: password,
    });
    myformData.save();
    console.log("data saved");
    res.json({ body: "we have recieved your rrquest", success: true });
  } catch (err) {
    console.log(err);
  }
});

module.exports = createuserRouter;
