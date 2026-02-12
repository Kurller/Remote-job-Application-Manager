import express from "express";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  applyToJob,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { uploadCV } from "../middlewares/uploadCV.js";




const router = express.Router();
router.post(
  "/apply/:jobId",
  auth,
  uploadCV.single("cv"),
  applyToJob
);

// Apply to a specific job
router.post("/apply/:jobId", auth, applyToJob);

// Logged-in user applications
router.get("/", auth, getUserApplications);

// Admin: view all applications
router.get("/all", auth, isAdmin, getAllApplications);

// Admin: update application status
router.put("/:id", auth, isAdmin, updateApplicationStatus);

export default router;
