const { DataTypes } = require('sequelize');
const { sequelize } = require('../../Data/db');

const JOProjects = sequelize.define('JOProjects', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ProjectTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    URL: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    CandidateId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    tableName: 'JOProjects',
    timestamps: true,
});

module.exports = JOProjects;
