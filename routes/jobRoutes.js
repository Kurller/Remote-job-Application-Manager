import express from "express";
import authMiddleware from "../middlewares/auth.js";
import {
  createJob,
  getJobs,
  updateJobStatus
} from "../controllers/jobController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management APIs
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *                 example: Backend Developer
 *               company:
 *                 type: string
 *                 example: Google
 *               location:
 *                 type: string
 *                 example: Lagos
 *               status:
 *                 type: string
 *                 example: applied
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createJob);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getJobs);

/**
 * @swagger
 * /jobs/{id}/status:
 *   put:
 *     summary: Update job status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: interview
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       404:
 *         description: Job not found
 */
router.put("/:id/status", authMiddleware, updateJobStatus);

export default router;