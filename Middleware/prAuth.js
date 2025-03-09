const asyncError = require("../Middleware/asyncError.js");
const errorHandler = require("../Utils/errorHandler");
const jwt = require("jsonwebtoken");
const PRMember = require("../Model/prModel.js");

exports.VerifyPRMember = asyncError(async (req, res, next) => {
    const token = req.header("authorization");

    if (!token) {
        return next(
            new errorHandler("Please login to access this resource", 401)
        );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const member = await PRMember.findByPk(decodedData.id);

    if (member) {
        req.user = {
            member: member,
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