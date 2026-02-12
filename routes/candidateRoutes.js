import express from "express";
import auth from "../middlewares/auth.js";
import { createCandidate, getCandidates, getCandidateById, deleteCandidate } from "../controllers/candidateController.js";

const router = express.Router();

router.post("/", auth, createCandidate);           // create
router.get("/", auth, getCandidates);             // list all
router.get("/:id", auth, getCandidateById);       // get single
router.delete("/:id", auth, deleteCandidate);     // delete

export default router;
