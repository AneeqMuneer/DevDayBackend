const express = require("express");
const { RegisterProject } = require("../Controller/projectController");
const router = express.Router();

router.route("/register").post(RegisterProject);

module.exports = router;