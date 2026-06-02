/**
 * Standard API Response Handler
 * All responses follow format: { success, data, error, code }
 */

const responseHandler = {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {Number} status - HTTP status code
   * @param {Any} data - Response data payload
   * @param {String} message - Optional success message
   * @param {String} code - Response code (default: "SUCCESS")
   */
  success: (res, status, data, message = null, code = "SUCCESS") => {
    return res.status(status).json({
      success: true,
      data: data,
      error: null,
      code: code,
      ...(message && { message })
    });
  },

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {Number} status - HTTP status code
   * @param {String} message - Error message
   * @param {String} code - Error code
   * @param {Any} details - Optional additional details
   */
  error: (res, status, message, code = "INTERNAL_ERROR", details = null) => {
    return res.status(status).json({
      success: false,
      data: null,
      error: message,
      code: code,
      ...(details && { details })
    });
  },

  /**
   * Validation error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Array} errors - Array of validation errors
   */
  validationError: (res, message = "Validation failed", errors = []) => {
    return res.status(400).json({
      success: false,
      data: null,
      error: message,
      code: "VALIDATION_ERROR",
      errors: errors
    });
  },

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  notFound: (res, message = "Resource not found") => {
    return responseHandler.error(res, 404, message, "NOT_FOUND");
  },

  /**
   * Unauthorized response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  unauthorized: (res, message = "Unauthorized access") => {
    return responseHandler.error(res, 401, message, "UNAUTHORIZED");
  },

  /**
   * Forbidden response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  forbidden: (res, message = "Forbidden") => {
    return responseHandler.error(res, 403, message, "FORBIDDEN");
  },

  /**
   * Conflict response (duplicate entry, etc.)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  conflict: (res, message = "Resource already exists") => {
    return responseHandler.error(res, 409, message, "CONFLICT");
  }
};

module.exports = responseHandler;
