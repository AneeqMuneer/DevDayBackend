const { DataTypes } = require('sequelize');
const { joSequelize } = require('../../Data/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JOCandidate = joSequelize.define('JOCandidate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    FirstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    LastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['Male', 'Female']],
                msg: "Gender must be either 'Male' or 'Female'",
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
    Phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: [/^\d{11}$/],
                msg: "Invalid contact number format. It must be exactly 11 digits.",
            },
        },
    },
    Summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    DomainPreference: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    CVResume: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    AuthCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    AuthCodeExpire: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ProfileCreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'JOCandidates',
    timestamps: true,
    hooks: {
        beforeCreate: async (pr) => {
            if (pr.Password) {
                const salt = bcrypt.genSaltSync(10);
                pr.Password = bcrypt.hashSync(pr.Password, salt);
            }
        }
    }
});

JOCandidate.prototype.getJWTToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

JOCandidate.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password);
};

JOCandidate.prototype.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

JOCandidate.prototype.getAuthCode = function () {
    this.AuthCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.AuthCodeExpire = Date.now() + 15 * 60 * 1000;
    return this.AuthCode;
}

JOCandidate.prototype.IsAuthCodeValid = function () {
    return this.AuthCodeExpire > Date.now();
}

module.exports = JOCandidate;
