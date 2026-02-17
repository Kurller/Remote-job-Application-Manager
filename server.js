import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import tailoredCVRoutes from "./routes/tailoredCVRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";

/* =========================
   TRUST PROXY (Render)
========================= */
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

/* =========================
   CORS (Production Safe)
========================= */


// Get allowed origins from env variable
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman) or if origin is in the whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: ${origin} is not allowed`));
      }
    },
    credentials: true,
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
   HEALTH CHECK (RENDER)
========================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Remote Job API is running 🚀" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  res.status(500).json({
    message: "Internal server error",
    ...(isProd ? {} : { error: err.message, stack: err.stack }),
  });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${isProd ? "production" : "development"})`);
});
