const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");
// Remove the global multer import as it's causing conflicts
// const upload = require("./Middleware/multer");

console.log("App starting...");

app.use(cors({ origin: "*" }));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Remove the global multer middleware as it conflicts with route-specific multer
// app.use(upload.any());

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