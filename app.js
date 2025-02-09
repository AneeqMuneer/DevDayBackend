const express = require("express");
const app = express();
const middleware = require("./Middleware/error");

app.use(express.json());

const ambassadorRoutes = require("./Routes/ambassadorRoutes");

app.use("/BrandAmbassador", ambassadorRoutes);

app.use(middleware)
module.exports = app;