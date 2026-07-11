import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import { pool } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import tailoredCVRoutes from "./routes/tailoredCVRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";

// ================= TRUST PROXY =================
app.set("trust proxy", 1);

// ================= SECURITY =================
app.use(helmet());

// ================= LOGGING =================
app.use(morgan(isProd ? "combined" : "dev"));

// ================= SWAGGER =================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================= CORS =================
const allowedOrigins = [
  "https://remote-job-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:10000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin?.includes("onrender.com") ||
      origin?.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ================= BODY PARSERS =================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ================= COOKIES =================
app.use(cookieParser());

// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/tailored-cvs", tailoredCVRoutes);
app.use("/candidates", candidateRoutes);
app.use("/cvs", cvRoutes);

// ================= HEALTH CHECK =================
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    message: "Remote Job API is running 🚀",
    docs: "/api-docs",
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: err.message,
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File too large (max 10MB)",
    });
  }

  res.status(500).json({
    message: "Internal server error",
    ...(isProd ? {} : { error: err.message }),
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(
      `📄 Swagger Docs: ${process.env.RENDER_EXTERNAL_URL}/api-docs`
    );
  } else {
    console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
  }
});