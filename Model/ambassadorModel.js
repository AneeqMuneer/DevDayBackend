const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');

const BrandAmbassador = sequelize.define('BrandAmbassador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    Code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    CNIC: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Institution: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'BrandAmbassadors',
    timestamps: true,
});

module.exports = BrandAmbassador;