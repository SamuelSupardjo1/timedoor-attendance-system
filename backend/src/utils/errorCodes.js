/**
 * Error Code Registry
 * Centralized mapping of error codes and their HTTP status codes
 */

const ERROR_CODES = {
  // Success codes
  SUCCESS: { status: 200, message: "Operation successful" },
  CREATED: { status: 201, message: "Resource created" },
  UPDATED: { status: 200, message: "Resource updated" },
  DELETED: { status: 200, message: "Resource deleted" },

  // Client errors (4xx)
  VALIDATION_ERROR: { status: 400, message: "Validation failed" },
  INVALID_INPUT: { status: 400, message: "Invalid input provided" },
  MISSING_FIELD: { status: 400, message: "Missing required field" },
  INVALID_CREDENTIALS: { status: 400, message: "Invalid email or password" },
  INVALID_CODE_FORMAT: { status: 400, message: "Invalid code format" },
  INVALID_MEETING_ID: { status: 400, message: "Invalid meeting ID" },
  INVALID_STUDENT_ID: { status: 400, message: "Invalid student ID" },

  UNAUTHORIZED: { status: 401, message: "Unauthorized access" },
  INVALID_TOKEN: { status: 401, message: "Invalid or expired token" },
  TOKEN_EXPIRED: { status: 401, message: "Token has expired" },

  FORBIDDEN: { status: 403, message: "Access forbidden" },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: "Insufficient permissions" },

  NOT_FOUND: { status: 404, message: "Resource not found" },
  USER_NOT_FOUND: { status: 404, message: "User not found" },
  ATTENDANCE_NOT_FOUND: { status: 404, message: "Attendance record not found" },
  CLASS_NOT_FOUND: { status: 404, message: "Class not found" },
  COURSE_NOT_FOUND: { status: 404, message: "Course not found" },
  LESSON_NOT_FOUND: { status: 404, message: "Lesson not found" },
  MEETING_NOT_FOUND: { status: 404, message: "Meeting not found" },
  STUDENT_NOT_FOUND: { status: 404, message: "Student not found" },
  TEACHER_NOT_FOUND: { status: 404, message: "Teacher not found" },
  FEEDBACK_NOT_FOUND: { status: 404, message: "Feedback not found" },

  CONFLICT: { status: 409, message: "Resource conflict" },
  DUPLICATE_ENTRY: { status: 409, message: "Duplicate entry — record already exists" },
  TEACHER_ALREADY_IN_CLASS: { status: 409, message: "Teacher already assigned to class" },
  STUDENT_ALREADY_IN_CLASS: { status: 409, message: "Student already in class" },

  // Server errors (5xx)
  INTERNAL_ERROR: { status: 500, message: "Internal server error" },
  DATABASE_ERROR: { status: 500, message: "Database error" },
  FOREIGN_KEY_ERROR: { status: 400, message: "Referenced record does not exist" },
  NOT_NULL_ERROR: { status: 400, message: "Missing required field" },
};

/**
 * Get error details by code
 * @param {String} code - Error code
 * @returns {Object} Error details with status and message
 */
const getErrorDetails = (code) => {
  return ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
};

/**
 * Map PostgreSQL error codes to application error codes
 * @param {Object} dbError - Database error object
 * @returns {String} Application error code
 */
const mapDatabaseError = (dbError) => {
  switch (dbError.code) {
    case "23505": // Unique violation
      return "DUPLICATE_ENTRY";
    case "23503": // Foreign key violation
      return "FOREIGN_KEY_ERROR";
    case "23502": // Not null violation
      return "NOT_NULL_ERROR";
    default:
      return "DATABASE_ERROR";
  }
};

module.exports = {
  ERROR_CODES,
  getErrorDetails,
  mapDatabaseError
};
