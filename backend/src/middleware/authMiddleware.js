const jwt = require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) return responseHandler.unauthorized(res, "No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return responseHandler.unauthorized(res, err.message.includes("expired") ? "Token has expired" : "Invalid or expired token");
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Admin has superuser access to all protected routes
    if (req.user.role === "admin") {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return responseHandler.forbidden(res, `Access denied. Required role(s): ${roles.join(", ")}`);
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };