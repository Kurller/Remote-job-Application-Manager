import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import tailoredCVRoutes from "./routes/tailoredCVRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";

dotenv.config();

const app = express();

/* =========================
   TRUST PROXY (RENDER)
========================= */
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
    ],
    credentials: true, // safe even if not using cookies
  })
);

/* =========================
   ROUTES
========================= */
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/tailored-cvs", tailoredCVRoutes);
app.use("/candidates", candidateRoutes);
app.use("/cvs", cvRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Remote Job API is running 🚀" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
