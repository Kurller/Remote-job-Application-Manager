import { v2 as cloudinary } from "cloudinary";
import { pool } from "../config/db.js";
import axios from "axios";
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/* =========================
   Upload CV
========================= */
export const uploadCV = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only PDF or DOC/DOCX files allowed" });
    }

    // Upload to Cloudinary using buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "remote-job-manager/cvs",
          resource_type: "raw", // important for non-image files
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Deactivate previous CVs
    await pool.query(`UPDATE cvs SET is_active = false WHERE user_id = $1`, [
      userId,
    ]);

    // Get next version safely
    const versionResult = await pool.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS version FROM cvs WHERE user_id = $1`,
      [userId]
    );
    const version = parseInt(versionResult.rows[0].version, 10);

    // Insert new CV record
    const dbResult = await pool.query(
      `INSERT INTO cvs 
        (user_id, filename, mimetype, file_url, path, version, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        req.file.originalname,
        req.file.mimetype,
        uploadResult.secure_url, // file_url
        uploadResult.public_id,  // store public_id for future deletes
        version,
        true,
      ]
    );

    return res.status(201).json({
      message: "CV uploaded successfully",
      cv: dbResult.rows[0],
    });
  } catch (error) {
    console.error("Upload CV Error:", error);

    // Return clear error for frontend
    return res.status(500).json({
      message: "Failed to upload CV",
      error: error.message,
    });
  }
};
/* =========================
   Get all user CVs
========================= */
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM cvs WHERE user_id=$1 ORDER BY version DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get CVs Error:", error);
    res.status(500).json({ message: "Failed to fetch CVs", error: error.message });
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
      `DELETE FROM cvs WHERE id=$1 AND user_id=$2 RETURNING id`,
      [cvId, userId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "CV not found" });

    res.json({ message: "CV deleted successfully" });
  } catch (error) {
    console.error("Delete CV Error:", error);
    res.status(500).json({ message: "Failed to delete CV", error: error.message });
  }
};

/* =========================
   Download CV
========================= */
export const downloadCV = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get active CV
    const result = await pool.query(
      `SELECT filename, file_url 
       FROM cvs 
       WHERE user_id=$1 AND is_active=true 
       LIMIT 1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No CV found" });
    }

    const { filename, file_url } = result.rows[0];

    const response = await axios.get(file_url, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader("Content-Type", "application/pdf");

    response.data.pipe(res);
  } catch (error) {
    console.error("Download CV Error:", error);
    res.status(500).json({
      message: "Failed to download CV",
      error: error.message,
    });
  }
};