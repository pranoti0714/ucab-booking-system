const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Ride ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayTransactionId: {
    type: String,
    default: ''
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    default: ''
  },
  commission: {
    type: Number,
    required: [true, 'Commission is required'],
    min: [0, 'Commission cannot be negative']
  },
  driverEarnings: {
    type: Number,
    required: [true, 'Driver earnings are required'],
    min: [0, 'Driver earnings cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  promoCode: {
    type: String,
    default: ''
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  surgeAmount: {
    type: Number,
    default: 0
  },
  baseFare: {
    type: Number,
    required: [true, 'Base fare is required'],
    min: [0, 'Base fare cannot be negative']
  },
  distanceFare: {
    type: Number,
    required: [true, 'Distance fare is required'],
    min: [0, 'Distance fare cannot be negative']
  },
  timeFare: {
    type: Number,
    required: [true, 'Time fare is required'],
    min: [0, 'Time fare cannot be negative']
  }
}, {
  timestamps: true
});

paymentSchema.index({ rideId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ driverId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
