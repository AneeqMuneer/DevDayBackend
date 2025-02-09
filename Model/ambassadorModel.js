const { DataTypes } = require('sequelize');
const { sequelize } = require('../Data/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BrandAmbassador = sequelize.define('BrandAmbassador', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    Code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Contact: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: {
                args: [/\d{11}$/],
                msg: "Invalid contact number format",
            },
        },
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: "Invalid email format" },
        },
    },
    CNIC: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: [/^\d{5}-\d{7}-\d{1}$/],
                msg: "Invalid CNIC format",
            },
        },
    },
    Institution: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    Instagram_Handle: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'BrandAmbassadors',
    timestamps: true,
    hooks: {
        beforeCreate: async (ambassador) => {
            if (ambassador.Password) {
                const salt = bcrypt.genSaltSync(10, "a");
                ambassador.Password = bcrypt.hashSync(ambassador.Password, salt);
            }
        },
        beforeUpdate: async (ambassador) => {
            if (ambassador.Password) {
                const salt = bcrypt.genSaltSync(10, "a");
                ambassador.Password = bcrypt.hashSync(ambassador.Password, salt);
            }
        }
    }
});

BrandAmbassador.prototype.getJWTToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

BrandAmbassador.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password);
};

BrandAmbassador.prototype.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = BrandAmbassador;