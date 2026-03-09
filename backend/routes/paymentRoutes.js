const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { protect, authorizeUser, authorizeDriver } = require('../middleware/auth');
const { generateTransactionId } = require('../utils/helpers');

const router = express.Router();

router.post('/create', protect, authorizeUser, [
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('paymentMethod').isIn(['cash', 'card', 'wallet']).withMessage('Invalid payment method'),
  body('amount').isNumeric().withMessage('Amount must be numeric')
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

    const { rideId, paymentMethod, amount } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be processed for completed rides'
      });
    }

    const existingPayment = await Payment.findOne({ rideId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this ride'
      });
    }

    const commission = amount * 0.2;
    const driverEarnings = amount * 0.8;

    const payment = await Payment.create({
      rideId,
      userId: req.user._id,
      driverId: ride.driverId,
      amount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processing',
      transactionId: generateTransactionId(),
      commission,
      driverEarnings,
      baseFare: ride.baseFare,
      distanceFare: ride.distanceFare,
      timeFare: ride.timeFare,
      discountAmount: ride.discount || 0,
      surgeAmount: ride.surgeMultiplier > 1 ? (amount - (amount / ride.surgeMultiplier)) : 0
    });

    if (paymentMethod === 'card') {
      const mockPaymentResponse = {
        id: `pay_${Date.now()}`,
        status: 'succeeded',
        amount: amount * 100,
        currency: 'usd'
      };

      payment.gatewayTransactionId = mockPaymentResponse.id;
      payment.gatewayResponse = mockPaymentResponse;
      payment.paymentStatus = 'paid';
      await payment.save();

      await Driver.findByIdAndUpdate(ride.driverId, {
        $inc: {
          totalRides: 1,
          totalEarnings: driverEarnings
        }
      });
    }

    await Ride.findByIdAndUpdate(rideId, { paymentStatus: payment.paymentStatus });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paymentDate: payment.paymentDate
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

router.get('/:rideId', protect, async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
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

    const payment = await Payment.findOne({ rideId }).populate('rideId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/history/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (req.user.constructor.modelName === 'User' && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const payments = await Payment.find({ userId })
      .populate({
        path: 'rideId',
        populate: {
          path: 'driverId',
          select: 'name vehicleType vehicleNumber rating'
        }
      })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      payments,
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

router.get('/driver/history/:driverId', protect, async (req, res) => {
  try {
    const { driverId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (req.user.constructor.modelName === 'Driver' && driverId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const payments = await Payment.find({ driverId })
      .populate({
        path: 'rideId',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ driverId });

    res.json({
      success: true,
      payments,
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

router.post('/process-card', protect, authorizeUser, [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('cardNumber').isLength({ min: 16, max: 16 }).withMessage('Invalid card number'),
  body('expiryMonth').isLength({ min: 2, max: 2 }).withMessage('Invalid expiry month'),
  body('expiryYear').isLength({ min: 2, max: 2 }).withMessage('Invalid expiry year'),
  body('cvv').isLength({ min: 3, max: 4 }).withMessage('Invalid CVV'),
  body('cardholderName').trim().notEmpty().withMessage('Cardholder name is required')
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

    const { paymentId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;

    const payment = await Payment.findById(paymentId).populate('rideId');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    payment.paymentStatus = 'processing';
    await payment.save();

    setTimeout(async () => {
      try {
        const mockPaymentResponse = {
          id: `pay_${Date.now()}`,
          status: 'succeeded',
          amount: payment.amount * 100,
          currency: 'usd',
          card: {
            last4: cardNumber.slice(-4),
            brand: 'visa'
          }
        };

        payment.gatewayTransactionId = mockPaymentResponse.id;
        payment.gatewayResponse = mockPaymentResponse;
        payment.paymentStatus = 'paid';
        await payment.save();

        await Driver.findByIdAndUpdate(payment.driverId, {
          $inc: {
            totalRides: 1,
            totalEarnings: payment.driverEarnings
          }
        });

        await Ride.findByIdAndUpdate(payment.rideId._id, { paymentStatus: 'paid' });

        if (global.io) {
          global.io.to(payment.userId.toString()).emit('payment-successful', {
            paymentId: payment._id,
            transactionId: payment.transactionId
          });
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        payment.paymentStatus = 'failed';
        await payment.save();
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Payment is being processed',
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/refund', protect, [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required')
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

    const { paymentId, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Only paid payments can be refunded'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isUser = req.user.constructor.modelName === 'User';

    if (!isAdmin && (isUser && payment.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    payment.paymentStatus = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundDate = new Date();
    payment.refundReason = reason;
    await payment.save();

    await Driver.findByIdAndUpdate(payment.driverId, {
      $inc: {
        totalEarnings: -payment.driverEarnings
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundAmount: payment.refundAmount,
      refundDate: payment.refundDate
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
