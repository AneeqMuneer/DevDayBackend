const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');

const AdminPR = sequelize.define('AdminPR', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    
}, {
    tableName: 'AdminPRs',
    timestamps: true,
});

module.exports = AdminPR;