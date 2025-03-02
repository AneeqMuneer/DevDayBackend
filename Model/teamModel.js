const { DataTypes } = require("sequelize");
const { sequelize } = require("../Data/db.js");
const BrandAmbassador = require("./ambassadorModel.js");

const Team = sequelize.define(
  "Team",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    Competition_Id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Institute_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Team_Name: {
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
    Members: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    BA_Id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BrandAmbassador,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    Payment_Verification_Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Teams",
    timestamps: true,
  }
);

module.exports = Team;