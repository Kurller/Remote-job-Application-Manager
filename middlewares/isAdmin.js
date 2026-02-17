export default function isAdmin(req, res, next) {
  console.log("req.user.role:", req.user?.role);
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
}
