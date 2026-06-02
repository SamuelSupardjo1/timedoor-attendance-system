const responseHandler = require("../utils/responseHandler");
const { mapDatabaseError, getErrorDetails } = require("../utils/errorCodes");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle database errors
  if (err.code && (err.code === "23505" || err.code === "23503" || err.code === "23502")) {
    const errorCode = mapDatabaseError(err);
    const details = getErrorDetails(errorCode);
    return responseHandler.error(res, details.status, details.message, errorCode);
  }

  // Handle validation errors
  if (err.status === 400 && err.message.includes("validation")) {
    return responseHandler.validationError(res, err.message, err.errors);
  }

  // Handle custom application errors
  if (err.code) {
    const details = getErrorDetails(err.code);
    return responseHandler.error(res, err.status || details.status, err.message || details.message, err.code);
  }

  // Handle generic errors
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const code = err.code || "INTERNAL_ERROR";
  
  responseHandler.error(res, status, message, code);
};

module.exports = errorHandler;