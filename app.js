const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options('*', cors());

app.use(express.json());

const ambassadorRoutes = require("./Routes/ambassadorRoutes");

app.use("/BrandAmbassador", ambassadorRoutes);

app.use(middleware)
module.exports = app;