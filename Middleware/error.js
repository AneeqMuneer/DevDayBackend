const ErrorHandler = require("../Utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle Invalid Data (Cast Error in Sequelize)
    if (err.name === "SequelizeDatabaseError") {
        const message = `Database Error: ${err.message}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Unique Constraint Error (Duplicate Entry)
    if (err.name === "SequelizeUniqueConstraintError") {
        const message = `Duplicate Entry: ${err.errors[0].path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Validation Errors (e.g., required fields missing)
    if (err.name === "SequelizeValidationError") {
        const message = err.errors.map(e => e.message).join(", ");
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};