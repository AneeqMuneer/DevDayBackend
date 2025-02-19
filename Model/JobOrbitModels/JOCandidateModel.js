const { DataTypes } = require('sequelize');
const { sequelize } = require('../../Data/db.js');
const bcrypt = require('bcrypt');

const JOCandidate = sequelize.define('JOCandidate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    FirstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    LastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
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
    Phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    DomainPreference1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    DomainPreference2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    DomainPreference3: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    CVResume: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'JOCandidates',
    timestamps: true,
});

module.exports = JOCandidate;
