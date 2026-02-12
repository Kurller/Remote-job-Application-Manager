import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.js";
import { uploadCV, getUserCVs, downloadCV, deleteCV } from "../controllers/cvController.js";

const router = express.Router();

// Multer setup (memory storage, no files on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only PDF or Word files allowed"));
    cb(null, true);
  },
});

// Routes
router.post("/upload", auth, upload.single("cv"), uploadCV);
router.get("/", auth, getUserCVs);
router.get("/download/:id", auth, downloadCV);
router.delete("/delete/:id", auth, deleteCV);

export default router;
