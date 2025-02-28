const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');

const FYP = sequelize.define('FYP', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    projectName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    university: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    teamMembers: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    document: {
        type: DataTypes.BLOB,
        allowNull: false,
    }
}, {
    tableName: 'FYPs',
    timestamps: true,
});

module.exports = FYP;