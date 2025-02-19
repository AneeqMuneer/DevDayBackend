const { DataTypes } = require('sequelize');
const { sequelize } = require('../../Data/db.js');

const DEGREE_CHOICES = [
    'Non-Matriculation', 'Matriculation/O-Level', 'Intermediate/A-Level',
    'BA', 'BE', 'BFA', 'BBA', 'BS', 'BSc', 'BEd', 'BCom', 'BCom Hons',
    'BDS', 'LLB', 'DNS', 'DVM', 'DPT', 'MA', 'ME', 'MS', 'MSc', 'MEd',
    'LLM', 'MBA', 'MCom', 'MCom Hons', 'MFA', 'MPA', 'MBBS', 'Pharm-D',
    'Mphil', 'PHD', 'Diploma', 'Certificate', 'Short Course'
];

const JOEducation = sequelize.define('JOEducation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    DegreeTitle: {
        type: DataTypes.ENUM(DEGREE_CHOICES),
        allowNull: false,
    },
    Field: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Institution: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CompletionYear: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    Grade: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CandidateId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    tableName: 'JOEducation',
    timestamps: true,
});

module.exports = JOEducation;
