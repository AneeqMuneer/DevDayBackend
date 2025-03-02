const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");

const TeamModel = require("../Model/teamModel");
const CompetitionModel = require("../Model/competitionModel");
const { SendTeamRegisterMail } = require("../Utils/teamUtils");
const Team = require("../Model/teamModel");
const AmbassadorModel = require("../Model/ambassadorModel");

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
    const { Competition_Id, Institute_Name, Team_Name,  L_Name, L_Contact, L_Email, L_CNIC, Members, BA_Id } = req.body;

    if (!Competition_Id || !Institute_Name || !Team_Name || !Members || !BA_Id || !L_Name || !L_Contact || !L_Email || !L_CNIC) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    const competition = await CompetitionModel.findByPk(Competition_Id);
    
    if (!competition) {
        return next(new ErrorHandler("Competition not found.", 404));
    }

    if (Date.now() > competition.Competition_End) {
        return next(new ErrorHandler("Competition registration has been closed.", 400));
    }

    if (!Array.isArray(Members) || Members.length < competition.Min_Participants-1 || Members.length > competition.Max_Participants-1) {
        return next(new ErrorHandler("Invalid number of participants.", 400));
    }

    const TeamMembers = [ 
        { 
            Name: L_Name,
            Email: L_Email,
            Contact: L_Contact,
            CNIC: L_CNIC 
        }, 
        ...Members ];

    const emails = new Set();
    const contacts = new Set();
    const cnics = new Set();

    for (const member of TeamMembers) {
        if (!member.Name || !member.Email || !member.Contact || !member.CNIC) {
            return next(new ErrorHandler("All members must have Name, Email, Contact, and CNIC.", 400));
        }

        if (!/^\d{5}-\d{7}-\d{1}$/g.test(member.CNIC)) {
            return next(new ErrorHandler(`Invalid CNIC format for ${member.Name}.`, 400));
        }

        if (emails.has(member.Email) || contacts.has(member.Contact) || cnics.has(member.CNIC)) {
            return next(new ErrorHandler("Duplicate participant details detected.", 400));
        }

        emails.add(member.Email);
        contacts.add(member.Contact);
        cnics.add(member.CNIC);

        const emailArray = Array.from(emails);

        const existingTeam = await TeamModel.findOne({
            where: {
                Competition_Id,
                [Op.or]: emailArray.map((email, index) => ({
                    [Op.or]: [
                        { L_Email: email },
                        Sequelize.literal(`
                            EXISTS (
                                SELECT 1 FROM jsonb_array_elements("Members"::jsonb) AS member 
                                WHERE member->>'Email' = $${index + 1}
                            )
                        `)
                    ]
                }))
            },
            bind: emailArray
        });

        if (existingTeam) {
            return next(new ErrorHandler("One or more members are already registered in this competition.", 400));
        }
    }

    const ba = await AmbassadorModel.findByPk(BA_Id);

    if (!ba) {
        return next(new ErrorHandler("Brand Ambassador not found.", 404));
    }

    const team = await TeamModel.create({
        Competition_Id,
        Institute_Name,
        Team_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        BA_Id
    });

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