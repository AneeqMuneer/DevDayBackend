const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const TeamModel = require("../Model/teamModel");
const CompetitionModel = require("../Model/competitionModel");
const { SendTeamRegisterMail } = require("../Utils/teamUtils");

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
    const { Competition_Id, Institute_Name, Team_Name, L_Name, L_Email, L_Contact, L_CNIC, M1_Name, M1_Email, M1_Contact, M1_CNIC, M2_Name, M2_Email, M2_Contact, M2_CNIC, BA_Id } = req.body;

    if (!Competition_Id || !Institute_Name || !Team_Name || !L_Name || !L_Email || !L_Contact || !L_CNIC || !BA_Id) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    const competition = await CompetitionModel.findByPk(Competition_Id);

    if(!competition) {
        return next(new ErrorHandler("Competition not found.", 404));
    }

    if(Date.now() > competition.Competition_End) {
        return next(new ErrorHandler("Competition registration has been closed.", 400));
    }

    if (new Set([L_Email, M1_Email, M2_Email]).size !== 3 || new Set([L_Contact, M1_Contact, M2_Contact]).size !== 3 || new Set([L_CNIC, M1_CNIC, M2_CNIC]).size !== 3) {
        return next(new ErrorHandler("Participant details are repeating.\nPlease enter correct values", 400));
    }

    if (!/^\d{5}-\d{7}-\d{1}$/g.test(L_CNIC) || !/^\d{5}-\d{7}-\d{1}$/g.test(M1_CNIC) || !/^\d{5}-\d{7}-\d{1}$/g.test(M2_CNIC)) {
        return next(new ErrorHandler("Invalid CNIC format.", 400));
    }

    const members = [
        { Email: L_Email , Name: L_Name },
        { Email: M1_Email, Name: M1_Name},
        { Email: M2_Email, Name: M2_Name}
    ];

    for (const member of members) {
        const similarTeam = await TeamModel.findAll({
            where: {
                [Op.or]: [
                    { L_Email: member.Email, Competition_Id },
                    { M1_Email: member.Email, Competition_Id },
                    { M2_Email: member.Email, Competition_Id }
                ]
            }
        });

        if (similarTeam.length > 0) {
            return next(new ErrorHandler(`Member ${member.Name} is already registered in this competition.`, 400));
        }
    }

    const team = await TeamModel.create({
        Competition_Id,
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
        BA_Id
    });

    team.Competition_Name = competition.Competition_Name;

    SendTeamRegisterMail(L_Email, L_Name, competition.Competition_Name);

    res.status(200).json({
        success: true,
        message: "Team registered successfully.",
        team
    });
});

exports.ProcessPayment = catchAsyncError(async (req, res, next) => {
});

exports.ApprovePayment = catchAsyncError(async (req , res , next) => {
});