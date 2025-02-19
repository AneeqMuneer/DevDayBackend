const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');

const FYP = sequelize.define('FYP', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    
}, {
    tableName: 'FYPs',
    timestamps: true,
});

module.exports = FYP;