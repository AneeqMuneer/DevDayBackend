const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const AmbassadorModel = require("../Model/ambassadorModel");
const { createCode } = require("../Utils/ambassadorUtils");
const TokenCreation = require("../Utils/tokenCreation");
const { Op } = require("sequelize");

exports.Login = catchAsyncError(async (req, res, next) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return next(new ErrorHandler("Please enter Email and Password.", 400));
    }

    const Ambassador = await AmbassadorModel.findOne({
        where: { Email }
    });

    if (!Ambassador) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    const isPasswordMatched = await Ambassador.comparePassword(Password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    const data = await AmbassadorModel.findOne({
        where: { id: Ambassador.id }
    });

    TokenCreation(data, 201, res);
});

exports.SignUp = catchAsyncError(async (req, res, next) => {
    const { Name, Contact, Email, CNIC, Institution, Password, Instagram_Handle } = req.body;

    if (!Name || !Email || !Contact || !CNIC || !Institution || !Password) {
        return next(new ErrorHandler("Please fill the remaining fields.", 400));
    }

    const similarAmbassador = await AmbassadorModel.findAll({
        where: {
            [Op.or]: [
                { Email },
                { CNIC }
            ]
        }
    });

    if (similarAmbassador.length > 0) {
        return next(new ErrorHandler("Ambassador already exists.", 400));
    }

    do {
        var Code = createCode(Name, Institution);
        var anotherAmbassador = await AmbassadorModel.findAll({
            where: { Code }
        });
    } while (anotherAmbassador.length > 0);

    const ambassador = await AmbassadorModel.create({
        Code,
        Name,
        Contact,
        Email,
        CNIC,
        Institution,
        Password,
        Instagram_Handle
    });

    res.status(200).json({
        success: true,
        message: "Ambassador signUp successfull",
        ambassador
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

exports.GetAllBARegistration = catchAsyncError(async (req, res, next) => {
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