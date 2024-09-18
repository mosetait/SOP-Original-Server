const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication Middleware
exports.auth = async (req, res, next) => {
  try {

    const token = req?.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }


    // Verify Token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id); // Attach user data to request object
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    // If token is valid, move to the next middleware
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during authentication",
    });
  }
};

// Admin Role Check Middleware
exports.isAdmin = async (req, res, next) => {
  try {
    // Check if the logged-in user has an admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to admins only",
      });
    }

    // Proceed to the next middleware or handler if the user is an admin
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role verification failed",
    });
  }
};

// Stockist Role Check Middleware
exports.isStockist = async (req, res, next) => {
  try {
    // Check if the logged-in user has a stockist role
    if (req.user.role !== "stockist") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to stockists only",
      });
    }

    // Proceed to the next middleware or handler if the user is a stockist
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role verification failed",
    });
  }
};
