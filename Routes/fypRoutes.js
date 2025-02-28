const express = require("express");
const router = express.Router();
const { RegisterFyp } = require("../Controller/fypController");

router.route("/registerFYP").post(RegisterFyp);


module.exports = router;