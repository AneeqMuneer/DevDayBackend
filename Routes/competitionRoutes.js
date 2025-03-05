const express = require("express");
const { getAllCompetitions , addBulkCompetitions } = require("../Controller/competitionController");
const router = express.Router();

router.route("/allCompetitions").get(getAllCompetitions);
router.route("/addBulkCompetitions").post(addBulkCompetitions);

module.exports = router;