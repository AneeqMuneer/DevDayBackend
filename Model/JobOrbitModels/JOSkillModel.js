const { DataTypes } = require("sequelize");
const { joSequelize } = require('../../Data/db');

const JOSkills = joSequelize.define('JOSkills', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    SkillName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CandidateId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    tableName: 'JOSkills',
    timestamps: true,
});

module.exports = JOSkills;
