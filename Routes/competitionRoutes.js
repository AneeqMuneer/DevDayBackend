const express = require("express");
const { getAllCompetitions } = require("../Controller/competitionController");
const router = express.Router();

router.route("/allCompetitions").get(getAllCompetitions);

module.exports = router;