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
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [DEGREE_CHOICES],
                msg: "Degree Title must be one of the following: " + DEGREE_CHOICES.join(", ")
            }
        }
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
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: {
                msg: "CompletionYear must be an integer"
            },
            min: {
                args: [2000],
                msg: "Completion Year must be greater than or equal to 2000"
            },
            max: {
                args: [2030],
                msg: "Completion Year must be lesser than or equal to 2030"
            }
        }
    },
    Score: {
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
