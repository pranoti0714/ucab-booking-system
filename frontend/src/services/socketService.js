import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  joinRoom(roomId) {
    this.emit('join-room', roomId)
  }

  leaveRoom(roomId) {
    this.emit('leave-room', roomId)
  }

  isConnected() {
    return this.socket?.connected || false
  }

  // Driver specific methods
  updateLocation(latitude, longitude) {
    this.emit('driver-location-update', { latitude, longitude })
  }

  toggleAvailability(available) {
    this.emit('driver-availability-toggle', { available })
  }

  // User specific methods
  requestRide(rideData) {
    this.emit('ride-request', rideData)
  }

  cancelRide(rideId, reason) {
    this.emit('ride-cancel', { rideId, reason })
  }

  // Payment methods
  processPayment(paymentData) {
    this.emit('payment-process', paymentData)
  }

  // Cleanup all listeners
  cleanup() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback)
        })
      })
      this.listeners.clear()
    }
  }
}

export default new SocketService()
