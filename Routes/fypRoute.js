const express = require("express");
const router = express.Router();
const { RegisterFyp } = require("../Controller/fymController");

router.route("/registerFYP").post(RegisterFyp);


module.exports = router;