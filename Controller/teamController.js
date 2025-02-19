const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const TeamModel = require("../Model/teamModel");
const { SendTeamRegisterMail } = require("../Utils/teamUtils");

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
});

exports.ProcessPayment = catchAsyncError(async (req, res, next) => {
});

exports.ApprovePayment = catchAsyncError(async (req , res , next) => {
});