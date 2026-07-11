import express from "express";
import auth from "../middlewares/auth.js";
import {
  createTailoredCV,
  getUserCVs,
  downloadTailoredCV
} from "../controllers/tailoredCVController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TailoredCVs
 *   description: Tailored CV generation and management APIs
 */

/**
 * @swagger
 * /tailored-cvs:
 *   post:
 *     summary: Create a tailored CV
 *     tags: [TailoredCVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cv_id
 *               - job_id
 *             properties:
 *               cv_id:
 *                 type: integer
 *                 example: 1
 *               job_id:
 *                 type: integer
 *                 example: 1
 *               force:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Tailored CV created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, createTailoredCV);
/**
 * @swagger
 * /tailored-cvs:
 *   get:
 *     summary: Get all tailored CVs for the authenticated user
 *     tags: [TailoredCVs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tailored CVs
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getUserCVs);

/**
 * @swagger
 * /tailored-cvs/download/{id}:
 *   get:
 *     summary: Download a tailored CV
 *     tags: [TailoredCVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tailored CV ID
 *     responses:
 *       200:
 *         description: Tailored CV file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: CV not found
 */
router.get("/download/:id", auth, downloadTailoredCV);

export default router;