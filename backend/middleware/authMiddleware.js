import jwt from "jsonwebtoken";

// Helper to extract token from Authorization header
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return req.headers.authorization?.split(" ")[1] || null;
};

export const protect = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    next();
  };
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const targetId = req.params?.id || req.params?.userId;
  
  // String conversion handles plain string IDs vs ObjectIds safely
  const isSelf = req.user.id?.toString() === targetId?.toString();
  const isPrivileged = ["superadmin", "admin"].includes(req.user.role);

  if (!isSelf && !isPrivileged) {
    return res.status(403).json({ message: "Not allowed" });
  }

  next();
};