import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import tailoredCVRoutes from "./routes/tailoredCVRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import cvRoutes from "./routes/cvRoutes.js"

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/tailored-cvs", tailoredCVRoutes);
app.use("/candidates", candidateRoutes);
app.use("/cvs", cvRoutes)

app.use(errorHandler);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
