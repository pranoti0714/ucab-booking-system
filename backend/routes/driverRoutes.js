const express = require('express');
const { body, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { protect, authorizeDriver } = require('../middleware/auth');
const { generateEmailVerificationToken } = require('../utils/helpers');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('vehicleType').isIn(['sedan', 'suv', 'hatchback', 'luxury', 'auto']).withMessage('Invalid vehicle type'),
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('vehicleModel').trim().notEmpty().withMessage('Vehicle model is required'),
  body('vehicleColor').trim().notEmpty().withMessage('Vehicle color is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  // body('licenseExpiry').isISO8601().withMessage('Invalid license expiry date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name, email, password, phone, vehicleType, vehicleNumber,
      vehicleModel, vehicleColor, licenseNumber, licenseExpiry,
      licenseDocument, vehicleDocument
    } = req.body;

    const existingDriver = await Driver.findOne({ $or: [{ email }, { phone }, { licenseNumber }] });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver with this email, phone, or license already exists'
      });
    }

    const driver = await Driver.create({
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      vehicleColor,
      licenseNumber,
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      licenseDocument,
      vehicleDocument
    });

    const token = driver.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted. Please wait for approval.',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        isApproved: driver.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (driver.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
    }

    const isMatch = await driver.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = driver.getSignedJwtToken();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        isApproved: driver.isApproved,
        availability: driver.availability,
        rating: driver.rating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/profile', protect, authorizeDriver, async (req, res) => {
  try {
    res.json({
      success: true,
      driver: {
        id: req.driver._id,
        name: req.driver.name,
        email: req.driver.email,
        phone: req.driver.phone,
        vehicleType: req.driver.vehicleType,
        vehicleNumber: req.driver.vehicleNumber,
        vehicleModel: req.driver.vehicleModel,
        vehicleColor: req.driver.vehicleColor,
        licenseNumber: req.driver.licenseNumber,
        isApproved: req.driver.isApproved,
        availability: req.driver.availability,
        rating: req.driver.rating,
        totalRides: req.driver.totalRides,
        totalEarnings: req.driver.totalEarnings,
        profilePicture: req.driver.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/update', protect, authorizeDriver, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, phone, profilePicture } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email && email !== req.driver.email) {
      const existingDriver = await Driver.findOne({ email });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      updateData.email = email;
    }
    if (phone && phone !== req.driver.phone) {
      const existingDriver = await Driver.findOne({ phone });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
      updateData.phone = phone;
    }
    if (profilePicture) updateData.profilePicture = profilePicture;

    const driver = await Driver.findByIdAndUpdate(
      req.driver._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        profilePicture: driver.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/availability', protect, authorizeDriver, async (req, res) => {
  try {
    const { availability } = req.body;

    if (typeof availability !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Availability must be a boolean'
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.driver._id,
      { availability },
      { new: true }
    );

    res.json({
      success: true,
      message: `Availability updated to ${availability ? 'Online' : 'Offline'}`,
      availability: driver.availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/location', protect, authorizeDriver, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.driver._id,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: driver.currentLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/ride-history', protect, authorizeDriver, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ driverId: req.driver._id })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ driverId: req.driver._id });

    res.json({
      success: true,
      rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/earnings', protect, authorizeDriver, async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);

    const thisMonth = new Date(today);
    thisMonth.setMonth(today.getMonth() - 1);

    const dailyEarnings = await Ride.aggregate([
      {
        $match: {
          driverId: driver._id,
          status: 'completed',
          createdAt: { $gte: today }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'rideId',
          as: 'payment'
        }
      },
      {
        $unwind: '$payment'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.driverEarnings' }
        }
      }
    ]);

    const weeklyEarnings = await Ride.aggregate([
      {
        $match: {
          driverId: driver._id,
          status: 'completed',
          createdAt: { $gte: thisWeek }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'rideId',
          as: 'payment'
        }
      },
      {
        $unwind: '$payment'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.driverEarnings' }
        }
      }
    ]);

    const monthlyEarnings = await Ride.aggregate([
      {
        $match: {
          driverId: driver._id,
          status: 'completed',
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'rideId',
          as: 'payment'
        }
      },
      {
        $unwind: '$payment'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.driverEarnings' }
        }
      }
    ]);

    res.json({
      success: true,
      earnings: {
        total: driver.totalEarnings,
        today: dailyEarnings[0]?.total || 0,
        thisWeek: weeklyEarnings[0]?.total || 0,
        thisMonth: monthlyEarnings[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
