const { Sequelize } = require('sequelize');
const { neon } = require('@neondatabase/serverless');
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const sql = neon(process.env.DATABASE_URL);
const joSql = neon(process.env.JO_DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'), 
    logging: false,
});

const joSequelize = new Sequelize(process.env.JO_DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'), 
    logging: false,
});

const connectWithNeon = async () => {
    try {
        // Connect to main database
        const result = await sql`SELECT version()`;
        console.log(`Connected to Neon DB, version: ${result[0].version}`);

        await sequelize.authenticate();
        console.log('Sequelize has connected to the Neon database successfully.');

        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');

        // Connect to JobOrbit database
        const joResult = await joSql`SELECT version()`;
        console.log(`Connected to JobOrbit Neon DB, version: ${joResult[0].version}`);

        await joSequelize.authenticate();
        console.log('Sequelize has connected to the JobOrbit Neon database successfully.');

        await joSequelize.sync({ alter: true });
        console.log('All JobOrbit models were synchronized successfully.');
    } catch (err) {
        console.error('An error occurred while connecting to the Neon database:', err);
    }
};

const dbConnect = async () => {
    await connectWithNeon();
};

module.exports = { dbConnect, sequelize, joSequelize };