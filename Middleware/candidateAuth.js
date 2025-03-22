const asyncError = require("../Middleware/asyncError.js");
const errorHandler = require("../Utils/errorHandler");
const CandidateModel = require("../Model/JobOrbitModels/JOCandidateModel.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

exports.VerifyCandidate = asyncError(async (req, res, next) => {
    let token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        return next(
            new errorHandler("Please login to access this resource", 401)
        );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const Candidate = await CandidateModel.findByPk(decodedData.id);

    if (Candidate) {
        req.user = {
            Candidate,
        };
        next();
    } else {
        return next(
            new errorHandler(
                "Invalid Token Kindly Login Again Or Enter Correct Credentials",
                401
            )
        );
    }
});