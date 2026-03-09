const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  return {
    resetToken,
    resetTokenHash,
    expireTime: Date.now() + 10 * 60 * 1000
  };
};

const calculateDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const calculateFare = (distance, duration, vehicleType, surgeMultiplier = 1.0) => {
  const baseFares = {
    sedan: { base: 5, perKm: 1.5, perMin: 0.3 },
    suv: { base: 8, perKm: 2.0, perMin: 0.4 },
    hatchback: { base: 4, perKm: 1.2, perMin: 0.25 },
    luxury: { base: 15, perKm: 3.0, perMin: 0.6 },
    auto: { base: 3, perKm: 0.8, perMin: 0.2 }
  };

  const fare = baseFares[vehicleType];
  if (!fare) {
    throw new Error('Invalid vehicle type');
  }

  const distanceFare = distance * fare.perKm;
  const timeFare = duration * fare.perMin;
  const totalFare = (fare.base + distanceFare + timeFare) * surgeMultiplier;

  return {
    baseFare: fare.base,
    distanceFare: Math.round(distanceFare * 100) / 100,
    timeFare: Math.round(timeFare * 100) / 100,
    totalFare: Math.round(totalFare * 100) / 100,
    surgeMultiplier
  };
};

const findNearbyDrivers = async (driverModel, coordinates, maxDistance = 5000) => {
  return await driverModel.find({
    availability: true,
    isApproved: true,
    isBlocked: false,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  }).select('name vehicleType vehicleNumber rating currentLocation');
};

const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone);
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateOTP,
  generateTransactionId,
  generateResetToken,
  calculateDistance,
  calculateFare,
  findNearbyDrivers,
  validateEmail,
  validatePhone,
  formatCurrency,
  generateEmailVerificationToken
};
