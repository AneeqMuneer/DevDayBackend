const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');
const BrandAmbassador = require('./ambassadorModel.js');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    Team_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Project_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Supervisor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Institution_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_Email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    L_Contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_CNIC: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Members: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    BA_Code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Project_Report: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'Projects',
    timestamps: true,
});

module.exports = Project;