import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

/* =========================
   Upload CV Controller
========================= */
export const uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    /* Upload to Cloudinary */
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "remote-job-manager/cvs",
            resource_type: "raw", // IMPORTANT for PDF/DOC
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    /* Save to DB */
    const result = await pool.query(
      `
      INSERT INTO cvs (user_id, filename, mimetype, path)
      VALUES ($1, $2, $3, $4)
      RETURNING id, filename, mimetype, path, uploaded_at
      `,
      [
        userId,
        req.file.originalname,
        req.file.mimetype,
        uploadResult.secure_url,
      ]
    );

    res.status(201).json({
      message: "CV uploaded successfully",
      cv: result.rows[0],
    });
  } catch (error) {
    console.error("Upload CV Error:", error);
    res.status(500).json({ message: "Failed to upload CV" });
  }
};


// =========================
// Get all user CVs
// =========================
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, filename, mimetype, path, uploaded_at
       FROM cvs
       WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch CVs error:", err.message);
    res.status(500).json({ message: "Failed to fetch CVs" });
  }
};

// =========================
// Admin: Download CV from DB
// =========================


// =========================
// Admin: Download CV from DB
// =========================
export const downloadCV = async (req, res) => {
  try {
    const cvId = Number(req.params.id);
    if (isNaN(cvId)) {
      return res.status(400).json({ message: "Invalid CV id" });
    }

    const result = await pool.query(
      `SELECT filename, mimetype, file_data
       FROM cvs
       WHERE id = $1`,
      [cvId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "CV not found" });
    }

    const { filename, mimetype, file_data } = result.rows[0];

    res.setHeader("Content-Type", mimetype);

    // PDFs open in browser, others download
    const disposition =
      mimetype === "application/pdf" ? "inline" : "attachment";

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${filename}"`
    );

    res.end(file_data);
  } catch (err) {
    console.error("Download CV error:", err);
    res.status(500).json({ message: "Failed to fetch CV" });
  }
};


// =========================
// Delete CV
// =========================
export const deleteCV = async (req, res) => {
  try {
    const cvId = Number(req.params.id);
    const userId = req.user.id;

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
