const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { createCode } = require("../Utils/ambassadorUtils");
const TokenCreation = require("../Utils/tokenCreation");
const { Op } = require("sequelize");

const AmbassadorModel = require("../Model/ambassadorModel");
const TeamModel = require("../Model/teamModel");

const { SendEmail } = require("../Utils/ambassadorUtils");

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
    const isApproved = Ambassador.Approval;

    if (!isApproved) {
        return next(new ErrorHandler("Your account is not approved yet.", 401));
    }

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    const data = await AmbassadorModel.findOne({
        where: { id: Ambassador.id }
    });

    TokenCreation(data, 201, res);
});

exports.SignUp = catchAsyncError(async (req, res, next) => {
    const { Name, Contact, Email, CNIC, Institution, Instagram_Handle } = req.body;

    if (!Name || !Email || !Contact || !CNIC || !Institution) {
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
        Instagram_Handle
    });

    await SendEmail(ambassador.Email , ambassador.Name);

    res.status(200).json({
        success: true,
        message: "Ambassador signUp successfull",
        ambassador
    });
});

exports.GetAllAmbassador = catchAsyncError(async (req, res, next) => {
    const ambassadors = await AmbassadorModel.findAll({
        attributes: { exclude: ['Password', 'createdAt', 'updatedAt'] } // Exclude password from the response
    });

    res.status(200).json({
        success: true,
        count: ambassadors.length,
        ambassadors
    });
});

exports.GetAmbassadorById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorHandler("Please provide an ambassador ID", 400));
    }

    const ambassador = await AmbassadorModel.findByPk(id, {
        attributes: { exclude: ['Password', 'createdAt', 'updatedAt'] }
    });

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    res.status(200).json({
        success: true,
        ambassador
    });
});

exports.GetAmbassadorByCode = catchAsyncError(async (req, res, next) => {
    const { code } = req.body;

    if (!code) {
        return next(new ErrorHandler("Please provide a code", 400));
    }

    const ambassador = await AmbassadorModel.findOne({
        where: {
            Code: code
        },
        attributes: { exclude: ['Password'] }
    });

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    res.status(200).json({
        success: true,
        ambassador
    });
});

exports.GetAllBARegistration = catchAsyncError(async (req, res, next) => {
    const { code } = req.query;

    if (!code) {
        return next(new ErrorHandler("Please provide a Code", 400));
    }

    const ambassador = await AmbassadorModel.findOne({ where: { Code: code } });

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    const teams = await TeamModel.findAll({ where: { BA_Id: ambassador.id } });

    res.status(200).json({
        success: true,
        teams
    });
});

exports.Leaderboard = catchAsyncError(async (req, res, next) => {
    const teams = await TeamModel.findAll({
        attributes: { exclude: ['Password', 'createdAt', 'updatedAt'] }
    });

    res.status(200).json({
        success: true,
        count: teams.length,
        teams
    });
});

exports.ChangeOldPassword = catchAsyncError(async (req, res, next) => {
    const { id, OldPassword } = req.body;

    if (!OldPassword || !id) {
        return next(new ErrorHandler("Please provide the required details", 400));
    }

    const ambassador = await AmbassadorModel.findByPk(id);

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    const isPasswordMatched = await ambassador.comparePassword(OldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    req.body.ambassador = ambassador;

    return next();
});

exports.UpdatePassword = catchAsyncError(async (req, res, next) => {
    const { ambassador, NewPassword } = req.body;

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 400));
    }

    if (!NewPassword) {
        return next(new ErrorHandler("Please provide a new password", 400));
    }

    ambassador.Password = NewPassword;
    await ambassador.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

exports.ApproveBA = catchAsyncError(async (req , res , next) => {
    const { id } = req.body;

    if (!id) {
        return next(new ErrorHandler("Please provide an ambassador ID", 400));
    }

    const ambassador = await AmbassadorModel.findByPk(id);

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    if (ambassador.Approval) {
        res.status(200).json({
            success: true,
            message: "Ambassador is already approved"
        });
    }

    ambassador.Approval = true;
    await ambassador.save();

    await SendEmail(ambassador.Email , ambassador.Name);

    res.status(200).json({
        success: true,
        message: "Ambassador approved successfully"
    });
});