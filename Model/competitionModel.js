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
    Competition_Type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['General', 'CS', 'EE']],
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
    Competition_End: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    Price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Competitions',
    timestamps: true,
});

module.exports = Competition;