const catchAsyncError = require("../Middleware/asyncError");
const { Op } = require("sequelize");

const competitionModel = require("../Model/competitionModel");

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