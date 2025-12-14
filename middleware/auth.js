const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT secret - must be set in environment variables for production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('WARNING: JWT_SECRET not set. Using default value for development only.');
}

const SECRET = JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, SECRET);
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authorize, JWT_SECRET: SECRET };
