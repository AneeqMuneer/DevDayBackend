const express = require("express");
const { RegisterProject } = require("../Controller/projectController");
const router = express.Router();
const upload = require("../Middleware/multer");

router.route("/register").post(upload.single('Project_Report') , RegisterProject);

module.exports = router;