// controllers/cvController.js
import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
/* =========================
   Upload CV Controller
========================= */
export const uploadCV = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "remote-job-manager/cvs",
          resource_type: "raw", // for PDF/DOC
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url) return reject(new Error("Cloudinary returned no URL"));
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save to DB
    const result = await pool.query(
      `INSERT INTO cvs (user_id, filename, mimetype, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, filename, mimetype, file_url, uploaded_at`,
      [userId, req.file.originalname, req.file.mimetype, uploadResult.secure_url]
    );

    res.status(201).json({
      message: "CV uploaded successfully",
      cv: result.rows[0],
    });
  } catch (error) {
    console.error("Upload CV Error:", error);
    res.status(500).json({ message: "Failed to upload CV", error: error.message });
  }
};

/* =========================
   Get all user CVs
========================= */
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      `SELECT id, filename, mimetype, file_url, uploaded_at
       FROM cvs
       WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [userId] // ✅ provide value for $1
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch CVs error:", err.message);
    res.status(500).json({ message: "Failed to fetch CVs" });
  }
};

/* =========================
   Delete CV
========================= */
export const deleteCV = async (req, res) => {
  try {
    const cvId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (isNaN(cvId)) return res.status(400).json({ message: "Invalid CV id" });

    const result = await pool.query(
      `DELETE FROM cvs
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [cvId, userId]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "CV not found" });

    res.json({ message: "CV deleted successfully" });
  } catch (err) {
    console.error("Delete CV error:", err.message);
    res.status(500).json({ message: "Failed to delete CV" });
  }
};

/* =========================
   Download / Redirect CV
========================= */

export const downloadCV = async (req, res) => {
  try {
    const cvId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(cvId)) {
      return res.status(400).json({ message: "Invalid CV id" });
    }

    // Fetch CV record
    const result = await pool.query(
      `SELECT filename, mimetype, file_url
       FROM cvs
       WHERE id = $1 AND user_id = $2`,
      [cvId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "CV not found" });
    }

    const { filename, mimetype, file_url } = result.rows[0];

    // Fetch file from Cloudinary
    const response = await axios.get(file_url, {
      responseType: "stream",
    });

    // Force PDF download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.endsWith(".pdf") ? filename : filename + ".pdf"}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    response.data.pipe(res);
  } catch (err) {
    console.error("Download CV error:", err.message);
    res.status(500).json({ message: "Failed to download CV" });
  }
};
