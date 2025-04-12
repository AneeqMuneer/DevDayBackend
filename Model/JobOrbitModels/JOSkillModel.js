const { DataTypes } = require("sequelize");
const { sequelize } = require('../../Data/db');

const JOSkills = sequelize.define('JOSkills', {
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
