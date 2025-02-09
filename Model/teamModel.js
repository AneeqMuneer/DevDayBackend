const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');
const BrandAmbassador = require('./ambassadorModel.js');

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    CompetitionName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Team_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Leader_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Leader_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    Leader_whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Leader_cnic: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mem1_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mem1_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    mem1_whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mem1_cnic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mem2_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mem2_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    mem2_whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mem2_cnic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Institution: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    BA_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BrandAmbassador,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },      
    Payment_Verification_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'Teams',
    timestamps: true,
});

module.exports = Team;