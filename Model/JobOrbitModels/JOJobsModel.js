const { DataTypes } = require("sequelize");
const { joSequelize } = require('../../Data/db');

const JOJobs = joSequelize.define('JOJobs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CompanyName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CompanyOverview: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Jobs: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    }
}, {
    tableName: 'JOJobs',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['id'],
            using: 'BTREE'
        }
    ]
});

module.exports = JOJobs; 