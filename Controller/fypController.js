const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const FypModel = require("../Model/fypModel");
const { SendFypRegisterMail } = require("../Utils/fypUtils.js");

exports.RegisterFyp = catchAsyncError(async (req, res, next) => {
    const { projectName, university, title } = req.body;
    const teamMembers = JSON.parse(req.body.teamMembers);
    const document = req.file.buffer;
    
    if (!projectName || !university || !teamMembers || !title || !document) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    const similarTeam = await FypModel.findAll({
        where: {
            projectName,
            [Op.or]: teamMembers.map(member => ({
                teamMembers: {
                    [Op.contains]: [{ email: member.email }] // Check each email in the array
                }
            }))
        }
    });
    
    
    if (similarTeam.length > 0) {
        return next(new ErrorHandler(`One or more members are already registered for the FYP.`, 400));
    }

    const fyp = await FypModel.create({
        projectName,
        university,
        teamMembers,
        title,
        document
    });

    SendFypRegisterMail(teamMembers[0].email, teamMembers[0].name);
    
    res.status(200).json({
        success: true,
        message: "FYP registered successfully",
        fyp
    });
});

exports.DownloadFile = catchAsyncError(async (req, res, next) => {
    const { id } = req.query;
    const fyp = await FypModel.findByPk(id);

    if (!fyp) {
        return next(new ErrorHandler("FYP not found", 404));
    }

    res.setHeader("Content-Disposition", `attachment; filename=${fyp.projectName}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(fyp.document);
});