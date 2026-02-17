// middlewares/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export default function auth(req, res, next) {
  try {
    let token = null;

    // From Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // From query param
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id || !decoded.email) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
