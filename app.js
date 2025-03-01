const express = require("express");
const app = express();
const middleware = require("./Middleware/error");
const cors = require("cors");

// app.use(cors({
//     origin: "https://ba.devday25.com/",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.use(cors({ origin: "*" }));

app.use(express.json());

const ambassadorRoutes = require("./Routes/ambassadorRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const fypRoutes = require("./Routes/fypRoutes");
const competitionRoutes = require("./Routes/competitionRoutes")

app.use("/BrandAmbassador", ambassadorRoutes);
app.use("/Team", teamRoutes);
app.use("/FYP", fypRoutes);
app.use("/Competition", competitionRoutes);

app.use(middleware)
module.exports = app;