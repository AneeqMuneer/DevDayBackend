const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

// Configure rate limiter for team registration
const teamRegistrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: "Too many registration attempts. Please try again after 15 minutes."
    }
});

// Configure CORS
app.options('*', cors());  // Enable preflight response for all routes

app.use(cors({ 
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use("/Team", teamRegistrationLimiter, teamRoutes);
app.use("/Project", projectRoutes);
app.use("/Competition", competitionRoutes);
app.use("/PR", prRoutes);
app.use("/JO" , joRoutes);

app.use(middleware)
module.exports = app;
