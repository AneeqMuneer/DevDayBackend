const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const FypModel = require("../Model/teamModel");
const { SendFypRegisterMail } = require("../Utils/fypUtils.js");

exports.RegisterFyp = catchAsyncError(async (req, res, next) => {
    const { projectName, university, teamMembers, title, document } = req.body;
    
    if (!projectName || !university || !teamMembers || !title || !document) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    for (const member of teamMembers) {
        const similarTeam = await FypModel.findAll({
            where: {
            teamMembers: {
                [Op.contains]: [member.Email]
            },
            projectName
            }
        });

        if (similarTeam.length > 0) {
            return next(new ErrorHandler(`Member ${member.Email} is already registered for the FYP.`, 400));
        }
    }

    const fyp = await FypModel.create({
        projectName,
        university,
        teamMembers,
        title,
        document
    });

    SendFypRegisterMail(fyp, res);
    
    res.status(200).json({
        success: true,
        message: "FYP registered successfully",
        fyp
    });
});