import express from "express";
import auth from "../middlewares/auth.js";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  deleteCandidate
} from "../controllers/candidateController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management APIs
 */

/**
 * @swagger
 * /candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: 08012345678
 *               position:
 *                 type: string
 *                 example: Backend Developer
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, createCandidate);

/**
 * @swagger
 * /candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getCandidates);

/**
 * @swagger
 * /candidates/{id}:
 *   get:
 *     summary: Get a candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate details
 *       404:
 *         description: Candidate not found
 */
router.get("/:id", auth, getCandidateById);

/**
 * @swagger
 * /candidates/{id}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 */
router.delete("/:id", auth, deleteCandidate);

export default router;