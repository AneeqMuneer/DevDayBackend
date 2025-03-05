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

    res.status(200).json({
        success: true,
        competitions
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