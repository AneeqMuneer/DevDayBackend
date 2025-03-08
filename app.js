const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

// app.use(cors({
//     origin: "https://ba.devday25.com/",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.use(cors({ origin: "*" }));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse multipart/form-data
app.use(upload.any());

const ambassadorRoutes = require("./Routes/ambassadorRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const projectRoutes = require("./Routes/projectRoutes");
const competitionRoutes = require("./Routes/competitionRoutes")

app.use("/BrandAmbassador", ambassadorRoutes);
app.use("/Team", teamRoutes);
app.use("/Project", projectRoutes);
app.use("/Competition", competitionRoutes);

app.use(middleware)
module.exports = app;