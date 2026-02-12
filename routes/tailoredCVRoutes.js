import express from "express";
import auth from "../middlewares/auth.js";
import { createTailoredCV, getUserCVs, downloadTailoredCV } from "../controllers/tailoredCVController.js";

const router = express.Router();

router.post("/", auth, createTailoredCV);       // create
router.get("/", auth, getUserCVs);              // list all
router.get("/download/:id", auth, downloadTailoredCV);  // download

export default router;
