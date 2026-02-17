// candidateController.js (ESM)
import { pool } from "../config/db.js";

/* CREATE CANDIDATE */
export const createCandidate = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        message: "first_name, last_name, and email are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO candidates (first_name, last_name, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [first_name.trim(), last_name.trim(), email.toLowerCase()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // 🔑 Handle duplicate email
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Candidate with this email already exists",
      });
    }

    console.error("createCandidate error:", err.message);
    res.status(500).json({ message: "Failed to create candidate" });
  }
};


/* GET ALL CANDIDATES */
export const getCandidates = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM candidates ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getCandidates error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* DELETE CANDIDATE */
export const deleteCandidate = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM candidates WHERE id = $1 RETURNING *",
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Candidate not found" });

    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error("deleteCandidate error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* APPLY TO A JOB */
export const applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { candidate_id, job_id, tailored_cv_id } = req.body;

    if (!candidate_id || !job_id || !tailored_cv_id) {
      return res.status(400).json({
        message: "candidate_id, job_id, and tailored_cv_id are required",
      });
    }

    // Ensure tailored CV belongs to user
    const cvCheck = await pool.query(
      "SELECT id FROM tailored_cvs WHERE id=$1 AND user_id=$2",
      [tailored_cv_id, userId]
    );

    if (!cvCheck.rows.length)
      return res.status(403).json({ message: "Invalid tailored CV" });

    const result = await pool.query(
      "INSERT INTO applications (user_id, candidate_id, job_id, tailored_cv_id) VALUES ($1, $2, $3, $4) RETURNING id, status, applied_at",
      [userId, candidate_id, job_id, tailored_cv_id]
    );

    res.status(201).json({
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Candidate already applied to this job",
      });
    }

    console.error("applyToJob error:", err.message);
    res.status(500).json({ message: "Failed to apply for job" });
  }
};

/* GET USER APPLICATIONS */
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.id AS application_id,
        a.status,
        a.applied_at,
        j.title AS job_title,
        c.name AS candidate_name,
        t.filename AS tailored_cv
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN candidates c ON c.id = a.candidate_id
      JOIN tailored_cvs t ON t.id = a.tailored_cv_id
      WHERE a.user_id = $1
      ORDER BY a.applied_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getUserApplications error:", err.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* UPDATE APPLICATION STATUS (ADMIN / RECRUITER) */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "rejected",
      "hired",
    ];

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const result = await pool.query(
      "UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id, status",
      [status, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Application not found" });

    res.json({
      message: "Application status updated",
      application: result.rows[0],
    });
  } catch (err) {
    console.error("updateApplicationStatus error:", err.message);
    res.status(500).json({ message: "Failed to update status" });
  }
};
// Get a single candidate by ID
export const getCandidateById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM candidates WHERE id = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getCandidateById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
