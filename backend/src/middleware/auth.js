const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT and attaches req.user. Blocks the request otherwise.
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Restricts a route to specific roles. Usage: authorize("admin", "super_admin")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }
    next();
  };
};

module.exports = { protect, authorize };
