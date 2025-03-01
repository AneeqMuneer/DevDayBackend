const express = require("express");
const { RegisterTeam , ProcessPayment , ApprovePayment } = require("../Controller/teamController");
const router = express.Router();

router.route("/register").post(RegisterTeam);

module.exports = router;