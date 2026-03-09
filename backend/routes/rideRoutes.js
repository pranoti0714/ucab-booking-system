const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const { protect, authorizeUser, authorizeDriver } = require('../middleware/auth');
const { calculateFare, findNearbyDrivers, generateOTP, generateTransactionId } = require('../utils/helpers');

const router = express.Router();

router.post('/book', protect, authorizeUser, [
  body('pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('pickupLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Pickup coordinates must be [longitude, latitude]'),
  body('dropLocation.address').notEmpty().withMessage('Drop address is required'),
  body('dropLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Drop coordinates must be [longitude, latitude]'),
  body('vehicleType').isIn(['sedan', 'suv', 'hatchback', 'luxury', 'auto']).withMessage('Invalid vehicle type'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'wallet']).withMessage('Invalid payment method')
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

    const { pickupLocation, dropLocation, vehicleType, paymentMethod = 'cash', promoCode } = req.body;

    const distance = Math.sqrt(
      Math.pow(dropLocation.coordinates[0] - pickupLocation.coordinates[0], 2) +
      Math.pow(dropLocation.coordinates[1] - pickupLocation.coordinates[1], 2)
    ) * 111;

    const duration = distance * 2;

    const fareCalculation = calculateFare(distance, duration, vehicleType);

    const ride = await Ride.create({
      userId: req.user._id,
      pickupLocation,
      dropLocation,
      vehicleType,
      fare: fareCalculation.totalFare,
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      paymentMethod,
      promoCode,
      otp: generateOTP(),
      baseFare: fareCalculation.baseFare,
      distanceFare: fareCalculation.distanceFare,
      timeFare: fareCalculation.timeFare
    });

    const nearbyDrivers = await findNearbyDrivers(Driver, pickupLocation.coordinates);

    if (global.io) {
      nearbyDrivers.forEach(driver => {
        global.io.to(driver._id.toString()).emit('new-ride-request', {
          rideId: ride._id,
          pickupLocation,
          dropLocation,
          vehicleType,
          fare: fareCalculation.totalFare,
          distance: Math.round(distance * 100) / 100,
          userInfo: {
            name: req.user.name,
            phone: req.user.phone
          }
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully. Waiting for driver acceptance.',
      ride: {
        id: ride._id,
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        vehicleType: ride.vehicleType,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration,
        status: ride.status,
        otp: ride.otp,
        estimatedArrival: new Date(Date.now() + 10 * 60 * 1000)
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

router.get('/estimate', [
  body('pickupLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Pickup coordinates must be [longitude, latitude]'),
  body('dropLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Drop coordinates must be [longitude, latitude]')
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

    const { pickupLocation, dropLocation } = req.body;

    const distance = Math.sqrt(
      Math.pow(dropLocation.coordinates[0] - pickupLocation.coordinates[0], 2) +
      Math.pow(dropLocation.coordinates[1] - pickupLocation.coordinates[1], 2)
    ) * 111;

    const duration = distance * 2;

    const vehicleTypes = ['sedan', 'suv', 'hatchback', 'luxury', 'auto'];
    const estimates = [];

    for (const vehicleType of vehicleTypes) {
      const fareCalculation = calculateFare(distance, duration, vehicleType);
      estimates.push({
        vehicleType,
        fare: fareCalculation.totalFare,
        breakdown: fareCalculation
      });
    }

    res.json({
      success: true,
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      estimates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('userId', 'name phone profilePicture')
      .populate('driverId', 'name vehicleType vehicleNumber vehicleModel vehicleColor rating profilePicture currentLocation');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const isUser = req.user.constructor.modelName === 'User';
    const isDriver = req.user.constructor.modelName === 'Driver';

    if (isUser && ride.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (isDriver && ride.driverId && ride.driverId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/:id/accept', protect, authorizeDriver, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available'
      });
    }

    if (ride.driverId) {
      return res.status(400).json({
        success: false,
        message: 'Ride already accepted by another driver'
      });
    }

    ride.driverId = req.driver._id;
    ride.status = 'accepted';
    ride.driverArrivalTime = new Date(Date.now() + 10 * 60 * 1000);
    await ride.save();

    if (global.io) {
      global.io.to(ride.userId.toString()).emit('ride-accepted', {
        rideId: ride._id,
        driverInfo: {
          id: req.driver._id,
          name: req.driver.name,
          vehicleType: req.driver.vehicleType,
          vehicleNumber: req.driver.vehicleNumber,
          vehicleModel: req.driver.vehicleModel,
          vehicleColor: req.driver.vehicleColor,
          rating: req.driver.rating,
          profilePicture: req.driver.profilePicture,
          currentLocation: req.driver.currentLocation
        },
        estimatedArrival: ride.driverArrivalTime
      });
    }

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/:id/status', protect, [
  body('status').isIn(['arriving', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
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

    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const isUser = req.user.constructor.modelName === 'User';
    const isDriver = req.user.constructor.modelName === 'Driver';

    if (isUser && ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (isDriver && (!ride.driverId || ride.driverId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const validTransitions = {
      pending: ['cancelled'],
      accepted: ['arriving', 'cancelled'],
      arriving: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[ride.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${ride.status} to ${status}`
      });
    }

    ride.status = status;

    if (status === 'arriving') {
      ride.startTime = new Date();
    } else if (status === 'completed') {
      ride.endTime = new Date();
      
      const payment = await Payment.create({
        rideId: ride._id,
        userId: ride.userId,
        driverId: ride.driverId,
        amount: ride.fare,
        paymentMethod: ride.paymentMethod,
        paymentStatus: ride.paymentMethod === 'cash' ? 'pending' : 'paid',
        transactionId: generateTransactionId(),
        commission: ride.fare * 0.2,
        driverEarnings: ride.fare * 0.8,
        baseFare: ride.baseFare,
        distanceFare: ride.distanceFare,
        timeFare: ride.timeFare
      });

      await Driver.findByIdAndUpdate(ride.driverId, {
        $inc: {
          totalRides: 1,
          totalEarnings: payment.driverEarnings
        }
      });

      if (global.io) {
        global.io.to(ride.userId.toString()).emit('ride-completed', {
          rideId: ride._id,
          paymentId: payment._id
        });
      }
    } else if (status === 'cancelled') {
      ride.cancellationReason = req.body.reason || '';
      ride.cancelledBy = isUser ? 'user' : 'driver';
    }

    await ride.save();

    if (global.io) {
      const roomId = isUser ? ride.driverId?.toString() : ride.userId.toString();
      if (roomId) {
        global.io.to(roomId).emit('ride-status-updated', {
          rideId: ride._id,
          status: ride.status,
          updatedBy: isUser ? 'user' : 'driver'
        });
      }
    }

    res.json({
      success: true,
      message: `Ride status updated to ${status}`,
      ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/active/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.constructor.modelName === 'User' && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const activeRide = await Ride.findOne({
      userId,
      status: { $in: ['pending', 'accepted', 'arriving', 'in_progress'] }
    }).populate('driverId', 'name vehicleType vehicleNumber vehicleModel vehicleColor rating profilePicture currentLocation');

    res.json({
      success: true,
      ride: activeRide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/driver/active/:driverId', protect, async (req, res) => {
  try {
    const { driverId } = req.params;
    
    if (req.user.constructor.modelName === 'Driver' && driverId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const activeRide = await Ride.findOne({
      driverId,
      status: { $in: ['accepted', 'arriving', 'in_progress'] }
    }).populate('userId', 'name phone profilePicture');

    res.json({
      success: true,
      ride: activeRide
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
