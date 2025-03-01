const express = require("express");
const { RegisterFyp } = require("../Controller/fypController");
const router = express.Router();

router.route("/register").post(RegisterFyp);

module.exports = router;