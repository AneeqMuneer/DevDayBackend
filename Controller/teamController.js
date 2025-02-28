const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const TeamModel = require("../Model/teamModel");
const { SendTeamRegisterMail } = require("../Utils/teamUtils");

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
    const { Competition_Name, Institute_Name, Team_Name, L_Name, L_Email, L_Contact, L_CNIC, M1_Name, M1_Email, M1_Contact, M1_CNIC, M2_Name, M2_Email, M2_Contact, M2_CNIC, Institution, BA_Id } = req.body;

    if (!Competition_Name || !Institute_Name || !Team_Name || !L_Name || !L_Email || !L_Contact || !L_CNIC || !BA_Id) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    const members = [
        { Email: L_Email},
        { Email: M1_Email },
        { Email: M2_Email}
    ];

    for (const member of members) {
        const similarTeam = await TeamModel.findAll({
            where: {
                [Op.or]: [
                    { L_Email: member.Email, Competition_Name },
                    { M1_Email: member.Email, Competition_Name },
                    { M2_Email: member.Email, Competition_Name }
                ]
            }
        });

        if (similarTeam.length > 0) {
            return next(new ErrorHandler(`Member ${member.Email} is already registered in this competition.`, 400));
        }
    }

    const team = await TeamModel.create({
        Competition_Name,
        Institute_Name,
        Team_Name,
        L_Name,
        L_Email,
        L_Contact,
        L_CNIC,
        M1_Name,
        M1_Email,
        M1_Contact,
        M1_CNIC,
        M2_Name,
        M2_Email,
        M2_Contact,
        M2_CNIC,
        Institution,
        BA_Id
    });

    SendTeamRegisterMail(L_Email, L_Name);

    res.status(200).json({
        success: true,
        message: "Team registered successfully.",
    });
});

exports.ProcessPayment = catchAsyncError(async (req, res, next) => {
});

exports.ApprovePayment = catchAsyncError(async (req , res , next) => {
});