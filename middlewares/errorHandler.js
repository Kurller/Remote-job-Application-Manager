import multer from "multer";

const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  // ✅ Multer errors (file upload issues)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Only one CV file is allowed. Please upload a single file.",
      });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Please upload a smaller CV.",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  // ✅ Custom errors (optional)
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // ✅ Default fallback
  res.status(500).json({
    message: "Something went wrong",
  });
};

export default errorHandler;