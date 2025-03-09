const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const competitionModel = require("../Model/competitionModel");
const ErrorHandler = require("../Utils/errorHandler");

exports.getAllCompetitions = catchAsyncError(async (req, res, next) => {
    const { type } = req.query;

    let whereClause = {};

    if (type) {
        whereClause.Competition_Type = {
            [Op.like]: type
        };
    }

    const competitions = await competitionModel.findAll({
        where: whereClause
    });

    let groupedCompetitions = {};

    competitions.forEach(comp => {
        let displayType;

        switch (comp.Competition_Type) {
            case "GC":
                displayType = "General Competitions";
                break;
            case "CS":
                displayType = "Computer Science Competitions";
                break;
            case "EE":
                displayType = "Electrical Engineering Competitions";
                break;
            case "ES":
                displayType = "ESports Competitions";
                break;
            default:
                displayType = comp.Competition_Type;
        }

        if (comp.Rulebook !== null) {
            comp.Rulebook = `https://drive.usercontent.google.com/download?id=${comp.Rulebook}&export=download`;
        }

        if (!groupedCompetitions[displayType]) {
            groupedCompetitions[displayType] = [];
        }
        groupedCompetitions[displayType].push(comp);
    });

    res.status(200).json({
        success: true,
        competitions: groupedCompetitions
    });
});

exports.addBulkCompetitions = catchAsyncError(async (req, res, next) => {
    const competitions = req.body;

    if (!competitions) {
        return next(new ErrorHandler("Please provide competitions to add.", 400));
    }

    const createdCompetitions = await competitionModel.bulkCreate(competitions);

    res.status(201).json({
        success: true,
        competitions: createdCompetitions
    });
});