import express from "express";
import authMiddleware from "../middlewares/auth.js"; // note the .js
import { createJob, getJobs, updateJobStatus } from "../controllers/jobController.js";

const router = express.Router();

// Routes
router.post("/", authMiddleware, createJob);          // Create a new job
router.get("/", authMiddleware, getJobs);            // Get all jobs
router.put("/:id/status", authMiddleware, updateJobStatus); // Update job status

export default router;
