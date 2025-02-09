const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

const createDatabaseIfNotExists = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres',  // Connect to default postgres DB to create/check others
    });

    try {
        await client.connect();

        // Check if the database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            // Database doesn't exist, so create it
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`Database "${process.env.DB_NAME}" created successfully.`);
        } else {
            console.log(`Database "${process.env.DB_NAME}" already exists.`);
        }
    } catch (err) {
        console.error('Error checking or creating database:', err);
    } finally {
        await client.end();
    }
};

const connectWithSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Database has connected to the server successfully.\nHost: ${process.env.DB_HOST}`);
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (err) {
        console.error(`An error occurred while connecting to the database.\nError: ${err}`);
    }
};

const dbConnect = async () => {
    await createDatabaseIfNotExists();
    await connectWithSequelize();
};

module.exports = { dbConnect, sequelize };