const mongoose = require("mongoose");

const dbConnect = () => {
    mongoose.connect(process.env.DB_URL).then((data) => {
        console.log(`Database has connected to the server successfully.\n${data.connection.host}`);
    }).catch((err) => {
        console.log(`An error occured while connecting to the database.\n${err}`);
    });
}

module.exports = dbConnect;