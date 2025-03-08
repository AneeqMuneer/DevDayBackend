const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');

const Competition = sequelize.define('Competition', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    Competition_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Competition_Type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['GC', 'CS', 'EE']],
        }
    },
    Min_Participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Max_Participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Max_Registeration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Entry_Fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Prize: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Competitions',
    timestamps: true,
});

module.exports = Competition;