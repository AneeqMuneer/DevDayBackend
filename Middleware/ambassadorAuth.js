const asyncError = require("../Middleware/asyncError.js");
const errorHandler = require("../Utils/errorHandler");
const jwt = require("jsonwebtoken");
const BrandAmbassador = require("../Model/ambassadorModel.js");

exports.VerifyAmbassador = asyncError(async (req, res, next) => {
    const token = req.header("authorization");

    if (!token) {
        return next(
            new errorHandler("Please login to access this resource", 401)
        );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const Ambassador = await BrandAmbassador.findByPk(decodedData.id);

    if (Ambassador) {
        req.user = {
            Ambassador: Ambassador,
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