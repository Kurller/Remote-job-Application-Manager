import express from "express";
import path from "path";
import dotenv from "dotenv";
import "./config/db.js";

dotenv.config();
const app = express();

// API routes
import authRoutes from "./routes/authRoutes.js";
app.use("/auth", authRoutes);
// other routes...

// Serve frontend
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
