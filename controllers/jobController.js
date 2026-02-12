import { pool } from "../config/db.js"; // make sure .js is included

// GET all jobs
export const getJobs = async (req, res) => {
  let { limit, offset, type, location } = req.query;

  limit = parseInt(limit) || 10;
  offset = parseInt(offset) || 0;

  let query = "SELECT * FROM jobs";
  const values = [];
  const conditions = [];

  if (type) {
    values.push(type);
    // Include NULL types so jobs with no type still show
    conditions.push(`(type = $${values.length} OR type IS NULL)`);
  }

  if (location) {
    values.push(location);
    // Include NULL locations
    conditions.push(`(location = $${values.length} OR location IS NULL)`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    res.json({
      count: result.rows.length,
      limit,
      offset,
      filters: { type: type || null, location: location || null },
      jobs: result.rows,
    });
  } catch (err) {
    console.error("getJobs error:", err.message);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};



// GET single job by ID
export const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getJobById error:", err.message);
    res.status(500).json({ message: "Failed to fetch job" });
  }
};

// CREATE a new job
export const createJob = async (req, res) => {
  const { title, description, location, type, requirements } = req.body;
  if (!title) return res.status(400).json({ message: "Job title is required" });

  try {
    const result = await pool.query(
      `INSERT INTO jobs (title, description, location, type, requirements)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description || null, location || null, type || null, requirements || null]
    );
    res.status(201).json({ message: "Job created", job: result.rows[0] });
  } catch (err) {
    console.error("createJob error:", err.message);
    res.status(500).json({ message: "Failed to create job" });
  }
};

// UPDATE job status or info
export const updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const result = await pool.query(
      "UPDATE jobs SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job updated", job: result.rows[0] });
  } catch (err) {
    console.error("updateJobStatus error:", err.message);
    res.status(500).json({ message: "Failed to update job" });
  }
};

// DELETE a job
export const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM jobs WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted", job: result.rows[0] });
  } catch (err) {
    console.error("deleteJob error:", err.message);
    res.status(500).json({ message: "Failed to delete job" });
  }
};
