import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// REGISTER
// REGISTER
export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExist.rows.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    const user = result.rows[0];

    // Generate JWT tokens
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    // Return tokens along with success message
    res.status(201).json({
      message: "User registered",
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// LOGIN
export const login = async (req, res) => {
  console.log("Request body:", req.body); // <-- move inside route
  console.log("JWT secret:", process.env.JWT_SECRET);
  console.log("DB_HOST:", process.env.DB_HOST);
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!result.rows.length) 
      return res.status(400).json({ message: "Invalid credentials" });

    const user = result.rows[0];

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(400).json({ message: "Invalid credentials" });

    // 3️⃣ Sign tokens including role
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user" // ✅ include role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user" // ✅ include role
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // 4️⃣ Respond with tokens
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || "user"
      }
    });

  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
// REFRESH TOKEN
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ accessToken });
  } catch (err) {
    console.error("refresh token error:", err.message);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  // For JWT, logout is usually handled on frontend by deleting tokens
  res.json({ message: "Logged out successfully" });
};
