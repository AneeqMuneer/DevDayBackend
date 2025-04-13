const { DataTypes } = require("sequelize");
const { joSequelize } = require('../../Data/db');

const JOCertifications = joSequelize.define('JOCertifications', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    CertificateName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    IssuingOrganization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    IssueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    CertificateLink: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CandidateId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    tableName: 'JOCertifications',
    timestamps: true,
});

module.exports = JOCertifications;