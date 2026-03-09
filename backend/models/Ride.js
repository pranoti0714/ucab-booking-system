const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Pickup coordinates are required']
      }
    }
  },
  dropLocation: {
    address: {
      type: String,
      required: [true, 'Drop address is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Drop coordinates are required']
      }
    }
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['sedan', 'suv', 'hatchback', 'luxury', 'auto']
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  driverArrivalTime: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'driver', 'system'],
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    default: ''
  },
  promoCode: {
    type: String,
    default: ''
  },
  discount: {
    type: Number,
    default: 0
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0
  },
  otp: {
    type: String,
    default: ''
  },
  isOtpVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropLocation.coordinates': '2dsphere' });
rideSchema.index({ userId: 1, status: 1 });
rideSchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
