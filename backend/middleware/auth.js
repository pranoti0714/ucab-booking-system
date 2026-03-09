const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'driver') {
      user = await Driver.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

exports.authorizeDriver = (req, res, next) => {
  if (req.user.constructor.modelName !== 'Driver') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Driver access required'
    });
  }
  next();
};

exports.authorizeUser = (req, res, next) => {
  if (req.user.constructor.modelName !== 'User') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User access required'
    });
  }
  next();
};
