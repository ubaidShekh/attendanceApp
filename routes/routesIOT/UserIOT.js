const express = require("express");
const createuserRouterIOT = express.Router();
const UserIOT = require("../Modal/ModalIOT/UserIOT");

createuserRouterIOT.post("/", async (req, res) => {
  try {
    console.log("received request");
    const { name, email, password } = req.body;
    console.log(`name: ${name},
           
            email: ${email},
           
            password: ${password},
           `);

    const myformData = new UserIOT({
      fullName: name,

      email: email,

      password: password,
    });

    await myformData.save();
    console.log("data saved");
    res.json({ body: "we have received your request", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = createuserRouterIOT;
