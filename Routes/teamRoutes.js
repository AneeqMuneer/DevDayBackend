const express = require("express");
const router = express.Router();
const { RegisterTeam } = require("../Controller/teamController");

router.route("/registerTeam").post(RegisterTeam);


module.exports = router;