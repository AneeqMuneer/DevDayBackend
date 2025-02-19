const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const FypModel = require("../Model/teamModel");
const { SendFypRegisterMail } = require("../Utils/fypUtils.js");

exports.RegisterFyp = catchAsyncError(async (req, res, next) => {
});