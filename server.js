const app = require("./app.js");
const dotenv = require("dotenv");
const { dbConnect } = require("./Data/db.js");

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Exiting the process due to an uncaught exception");
    process.exit(1);
});

dotenv.config({ path: "./config/config.env" });
require("./Model/connect.js");

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}/`);
})

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to an uncaught exception");
    server.close(() => {
        process.exit(1);
    });
});