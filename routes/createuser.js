const express = require("express");
const createuserRouter = express.Router();
const User = require("../Modal/User");
createuserRouter.post("/", async (req, res) => {
  try {
    console.log("recieved request");
    const { employeeId, password } = req.body;
    console.log(`name: ${name},
            employeeId: ${employeeId},
          
            password: ${password},`);

    const myformData = new User({
      employeeId: employeeId,

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
