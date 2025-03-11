const { DataTypes } = require("sequelize");
const { sequelize } = require("../Data/db.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const PR = sequelize.define(
    "PR",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        Username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Team_Registered_Count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Amount_Submitted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Amount_Owed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
    tableName: 'PRs',
    timestamps: true,
    hooks: {
        beforeCreate: async (pr) => {
            if (pr.Password) {
                const salt = bcrypt.genSaltSync(10, "a");
                pr.Password = bcrypt.hashSync(pr.Password, salt);
            }
        },
        beforeUpdate: async (pr) => {
            if (pr.Password) {
                const salt = bcrypt.genSaltSync(10, "a");
                pr.Password = bcrypt.hashSync(pr.Password, salt);
            }
        }
    }
});

PR.prototype.getJWTToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

PR.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password);
};

PR.prototype.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = PR;