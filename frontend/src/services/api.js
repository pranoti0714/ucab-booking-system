import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// User API methods
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/update', userData),
  getRideHistory: (params) => api.get('/users/ride-history', { params }),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
}

// Driver API methods
export const driverAPI = {
  register: (driverData) => api.post('/drivers/register', driverData),
  login: (credentials) => api.post('/drivers/login', credentials),
  getProfile: () => api.get('/drivers/profile'),
  updateProfile: (driverData) => api.put('/drivers/update', driverData),
  updateAvailability: (availability) => api.put('/drivers/availability', availability),
  updateLocation: (location) => api.put('/drivers/location', location),
  getRideHistory: (params) => api.get('/drivers/ride-history', { params }),
  getEarnings: () => api.get('/drivers/earnings'),
}

// Ride API methods
export const rideAPI = {
  bookRide: (rideData) => api.post('/rides/book', rideData),
  getRide: (rideId) => api.get(`/rides/${rideId}`),
  updateRideStatus: (rideId, statusData) => api.put(`/rides/${rideId}/status`, statusData),
  acceptRide: (rideId) => api.put(`/rides/${rideId}/accept`),
  getFareEstimate: (locationData) => api.post('/rides/estimate', locationData),
  getActiveRide: (userId) => api.get(`/rides/active/${userId}`),
  getDriverActiveRide: (driverId) => api.get(`/rides/driver/active/${driverId}`),
}

// Payment API methods
export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments/create', paymentData),
  getPayment: (rideId) => api.get(`/payments/${rideId}`),
  getUserPaymentHistory: (userId, params) => api.get(`/payments/history/${userId}`, { params }),
  getDriverPaymentHistory: (driverId, params) => api.get(`/payments/driver/history/${driverId}`, { params }),
  processCardPayment: (paymentData) => api.post('/payments/process-card', paymentData),
  refundPayment: (refundData) => api.post('/payments/refund', refundData),
}

// Admin API methods
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getDrivers: () => api.get('/admin/drivers'),
  getRides: () => api.get('/admin/rides'),
  approveDriver: (driverId) => api.put(`/admin/drivers/${driverId}/approve`),
  blockUser: (userId, blockData) => api.put(`/admin/users/${userId}/block`, blockData),
  getReports: () => api.get('/admin/reports'),
}

export default api
