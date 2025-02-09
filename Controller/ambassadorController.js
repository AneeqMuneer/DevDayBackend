const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../middleware/asyncError");
const Ambassador = require("../Model/ambassadorModel");

exports.Login = catchAsyncError(async (req, res, next) => {
    console.log("Login");

    res.status(200).json({
        success: true,
        message: "Login"
    });
});

exports.SignUp = catchAsyncError(async (req, res, next) => {
    console.log("SignUp");

    res.status(200).json({
        success: true,
        message: "SignUp"
    });
});

exports.GetAllAmbassador = catchAsyncError(async (req, res, next) => {
    console.log("GetAllAmbassador");

    res.status(200).json({
        success: true,
        message: "GetAllAmbassador"
    });
});

exports.GetAmbassadorById = catchAsyncError(async (req, res, next) => {
    console.log("GetAmbassadorById");

    res.status(200).json({
        success: true,
        message: "GetAmbassadorById"
    });
});

exports.GetAllAmbassadorRegistration = catchAsyncError(async (req, res, next) => {
    console.log("GetAllAmbassadorRegistration");

    res.status(200).json({
        success: true,
        message: "GetAllAmbassadorRegistration"
    });
});

exports.Leaderboard = catchAsyncError(async (req, res, next) => {
    console.log("Leaderboard");

    res.status(200).json({
        success: true,
        message: "Leaderboard"
    });
});