const express = require("express");
const router = express.Router();
const { RegisterFyp, DownloadFile } = require("../Controller/fypController");
const multer = require("multer");

const upload = multer();

router.route("/registerFYP").post(upload.single("document") ,RegisterFyp);
router.route("/download").get(DownloadFile);


module.exports = router;