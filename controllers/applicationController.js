// applicationController.js

import { pool } from "../config/db.js";
// Apply to a job
// controllers/applicationController.js




export const applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.jobId, 10);
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "CV file is required" });
    }

    console.log("Apply attempt:", { userId, jobId });

    // Prevent duplicate
    const existing = await pool.query(
      "SELECT id FROM applications WHERE user_id = $1 AND job_id = $2",
      [userId, jobId]
    );
    console.log("Existing rows:", existing.rows);

    if (existing.rows.length) {
      return res.status(400).json({ message: "You already applied for this job" });
    }

    // Save CV
    const cvResult = await pool.query(
  `INSERT INTO cvs (user_id, filename, file_url, mimetype)
   VALUES ($1, $2, $3, $4)
   RETURNING id`,
  [userId, req.file.originalname, req.file.path, req.file.mimetype]
);

const cvId = cvResult.rows[0].id;
   // Insert application
    const appResult = await pool.query(
      `INSERT INTO applications (user_id, job_id, cv_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, jobId, cvId]
    );

    res.status(201).json({ message: "Application submitted successfully", application: appResult.rows[0] });
  } catch (err) {
    console.error("Apply job error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all applications (admin only)
export const getAllApplications = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.status,
        a.applied_at,
        u.id AS user_id,
        u.email AS user_name,
        j.id AS job_id,
        j.title AS job_title,
        c.id AS cv_id,
        c.filename AS cv_name,
        c.file_url AS cv_file
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      JOIN cvs c ON a.cv_id = c.id
      ORDER BY a.applied_at DESC
    `);

    const result = rows.map(r => ({
      id: r.id,
      status: r.status,
      appliedAt: r.applied_at,
      user: {
        id: r.user_id,
        name: r.user_name, // now email will show
      },
      job: {
        id: r.job_id,
        title: r.job_title,
      },
      cv: {
        id: r.cv_id,
        name: r.cv_name,
        file: r.cv_file,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.applied_at,
        j.title,
        c.filename AS cv_name,
        c.path AS cv_file
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN cvs c ON a.cv_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.applied_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
