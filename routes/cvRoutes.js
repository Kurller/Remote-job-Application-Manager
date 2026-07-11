import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.js";
import {
  uploadCV,
  getUserCVs,
  downloadCV,
  deleteCV,
} from "../controllers/cvController.js";

const router = express.Router();

/* =========================
   Multer Setup
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF or Word files allowed"), false);
    }

    cb(null, true);
  },
});

/**
 * @swagger
 * tags:
 *   name: CVs
 *   description: CV upload and management APIs
 */

/**
 * @swagger
 * /cvs/upload:
 *   post:
 *     summary: Upload a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: CV uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 *       401:
 *         description: Unauthorized
 */
router.post("/upload", auth, upload.single("cv"), uploadCV);

/**
 * @swagger
 * /cvs:
 *   get:
 *     summary: Get all CVs for the authenticated user
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of CVs
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getUserCVs);

/**
 * @swagger
 * /cvs/download/{id}:
 *   get:
 *     summary: Download a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CV ID
 *     responses:
 *       200:
 *         description: CV file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: CV not found
 */
router.get("/download/:id", auth, downloadCV);

/**
 * @swagger
 * /cvs/delete/{id}:
 *   delete:
 *     summary: Delete a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CV ID
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *       404:
 *         description: CV not found
 */
router.delete("/delete/:id", auth, deleteCV);

/* =========================
   Error Handler
========================= */
router.use((err, req, res, next) => {
  console.error("Multer Error:", err);

  return res.status(400).json({
    message: err.message || "File upload error",
  });
});

export default router;