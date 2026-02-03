const jwt = require("jsonwebtoken");
const User = require("../Modal/User");

const SECRET_KEY = process.env.JWT_SECRET || "mySimpleSecretKey123";

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user in database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token. User not found.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired.",
      });
    }
    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

module.exports = authenticateToken;
