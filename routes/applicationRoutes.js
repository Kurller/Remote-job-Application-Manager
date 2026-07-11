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

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

/**
 * @swagger
 * /applications/apply/{jobId}:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/apply/:jobId", auth, uploadCV.single("cv"), applyToJob);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get logged-in user's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user applications
 */
router.get("/", auth, getUserApplications);

/**
 * @swagger
 * /applications/all:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all applications
 *       403:
 *         description: Forbidden
 */
router.get("/all", auth, isAdmin, getAllApplications);

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Update application status (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Forbidden
 */
router.put("/:id", auth, isAdmin, updateApplicationStatus);

export default router;