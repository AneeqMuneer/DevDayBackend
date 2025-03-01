const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');
const BrandAmbassador = require('./ambassadorModel.js');

const FYP = sequelize.define('FYP', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    Team_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Project_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Supervisor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Institution: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_Email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    L_Contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    L_CNIC: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    M1_Name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    M1_Email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    M1_Contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    M1_CNIC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    M2_Name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    M2_Email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    M2_Contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    M2_CNIC: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    BA_Id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: BrandAmbassador,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    Project_Report: {
        type: DataTypes.BLOB,
        allowNull: false,
    }
}, {
    tableName: 'FYPs',
    timestamps: true,
});

module.exports = FYP;