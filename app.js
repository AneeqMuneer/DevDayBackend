const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");

// Configure CORS
app.use(cors({ 
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies with increased limit for larger payloads
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded bodies with increased limit
app.use(express.urlencoded({ 
    extended: true,
    limit: '50mb'
}));

// Remove the global multer middleware as it conflicts with route-specific multer
// app.use(upload.any());

const ambassadorRoutes = require("./Routes/ambassadorRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const projectRoutes = require("./Routes/projectRoutes");
const competitionRoutes = require("./Routes/competitionRoutes")
const prRoutes = require("./Routes/prRoutes.js");
const joRoutes = require("./Routes/joRoutes.js");

app.use("/BrandAmbassador", ambassadorRoutes);
app.use("/Team", teamRoutes);
app.use("/Project", projectRoutes);
app.use("/Competition", competitionRoutes);
app.use("/PR", prRoutes);
app.use("/JO" , joRoutes);

app.use(middleware)
module.exports = app;