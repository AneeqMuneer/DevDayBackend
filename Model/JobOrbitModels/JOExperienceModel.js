const { DataTypes } = require('sequelize');
const { joSequelize } = require('../../Data/db');

const JOExperience = joSequelize.define('JOExperience', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    JobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Company: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    StartDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    EndDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    CandidateId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    tableName: 'JOExperiences',
    timestamps: true,
});

module.exports = JOExperience;
