const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === "23505") {
    return res.status(400).json({ message: "Duplicate entry — record already exists" });
  }

  if (err.code === "23503") {
    return res.status(400).json({ message: "Referenced record does not exist" });
  }

  if (err.code === "23502") {
    return res.status(400).json({ message: "Missing required field" });
  }

  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
};

module.exports = errorHandler;