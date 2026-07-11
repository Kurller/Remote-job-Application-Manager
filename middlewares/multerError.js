module.exports = (err, req, res, next) => {
  console.error("MULTER ERROR:", err);

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message: "Too many files or invalid field name (max 20 CVs allowed)"
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Each CV must be less than 5MB"
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message
    });
  }

  next(err);
};
