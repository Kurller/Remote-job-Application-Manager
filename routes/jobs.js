import express from "express";
import { getJobs, createJob, getJobById, updateJobStatus, deleteJob } from "../controllers/jobController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// ===== PUBLIC ROUTES =====
// GET all jobs - remove public access if you want login required
// router.get("/", getJobs); // comment this out

// ===== PROTECTED ROUTES =====
router.get("/", authMiddleware, getJobs); // now requires token
router.get("/:id", authMiddleware, getJobById);
router.post("/", authMiddleware, createJob);
router.put("/:id/status", authMiddleware, updateJobStatus);
router.delete("/:id", authMiddleware, deleteJob);

export default router;
