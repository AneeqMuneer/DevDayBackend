const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const TokenCreation = require("../Utils/tokenCreation.js");

const CandidateModel = require("../Model/JobOrbitModels/JOCandidateModel.js");
const EducationModel = require("../Model/JobOrbitModels/JOEducationModel.js")
const ExperienceModel = require("../Model/JobOrbitModels/JOExperienceModel.js");
const ProjectModel = require("../Model/JobOrbitModels/JOProjectModel.js");
const SkillModel = require("../Model/JobOrbitModels/JOSkillModel.js");

exports.CandidateSignup = catchAsyncError(async (req , res , next) => {

});

exports.CandidateLogin = catchAsyncError(async (req , res , next) => {

});

exports.AddUserDetail = catchAsyncError(async (req , res , next) => {

});

exports.RetrieveUserDetail = catchAsyncError(async (req , res , next) => {

});