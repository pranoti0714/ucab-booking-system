import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { MapPin, Car, DollarSign, Clock, Search } from 'lucide-react'
import axios from 'axios'

const CabBooking = () => {
  const [formData, setFormData] = useState({
    pickupLocation: {
      address: '',
      coordinates: [0, 0]
    },
    dropLocation: {
      address: '',
      coordinates: [0, 0]
    },
    vehicleType: 'sedan'
  })
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(false)

  const { data: estimatesData, isLoading: estimatesLoading } = useQuery(
    ['fareEstimate', formData.pickupLocation.coordinates, formData.dropLocation.coordinates],
    async () => {
      if (formData.pickupLocation.coordinates[0] === 0 || formData.dropLocation.coordinates[0] === 0) {
        return null
      }
      const response = await axios.post('/api/rides/estimate', {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation
      })
      return response.data
    },
    {
      enabled: formData.pickupLocation.coordinates[0] !== 0 && formData.dropLocation.coordinates[0] !== 0
    }
  )

  const handleLocationChange = (type, value) => {
    // In a real app, you would use a geocoding service here
    const mockCoordinates = type === 'pickup' 
      ? [77.2090 + Math.random() * 0.1, 28.6139 + Math.random() * 0.1]
      : [77.2090 + Math.random() * 0.1, 28.6139 + Math.random() * 0.1]

    setFormData(prev => ({
      ...prev,
      [`${type}Location`]: {
        address: value,
        coordinates: mockCoordinates
      }
    }))
  }

  const handleBookRide = async (vehicleType, fare) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/rides/book', {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        vehicleType,
        paymentMethod: 'cash'
      })
      
      // Redirect to ride tracking
      window.location.href = `/ride/${response.data.ride.id}`
    } catch (error) {
      console.error('Failed to book ride:', error)
      alert('Failed to book ride. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const vehicleTypes = [
    { type: 'sedan', name: 'Sedan', icon: '🚗', capacity: '4 seats' },
    { type: 'suv', name: 'SUV', icon: '🚙', capacity: '6 seats' },
    { type: 'hatchback', name: 'Hatchback', icon: '🚕', capacity: '4 seats' },
    { type: 'luxury', name: 'Luxury', icon: '🏎️', capacity: '4 seats' },
    { type: 'auto', name: 'Auto', icon: '🛺', capacity: '3 seats' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Your Ride</h1>
        <p className="text-gray-600 mt-2">Enter your pickup and drop locations to get started</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ride Details</h2>
          
          <div className="space-y-4">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.pickupLocation.address}
                  onChange={(e) => handleLocationChange('pickup', e.target.value)}
                  placeholder="Enter pickup location"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Drop Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.dropLocation.address}
                  onChange={(e) => handleLocationChange('drop', e.target.value)}
                  placeholder="Enter drop location"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Distance and Time */}
            {estimatesData && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-semibold">{estimatesData.distance} km</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Est. Time</p>
                      <p className="font-semibold">{estimatesData.duration} min</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Vehicle</h2>
          
          {estimatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Calculating fares...</p>
            </div>
          ) : estimatesData?.estimates ? (
            <div className="space-y-3">
              {estimatesData.estimates.map((estimate) => {
                const vehicle = vehicleTypes.find(v => v.type === estimate.vehicleType)
                return (
                  <div
                    key={estimate.vehicleType}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-300 ${
                      formData.vehicleType === estimate.vehicleType
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, vehicleType: estimate.vehicleType }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{vehicle?.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{vehicle?.name}</h3>
                          <p className="text-sm text-gray-500">{vehicle?.capacity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ${estimate.fare}
                        </p>
                        <p className="text-xs text-gray-500">Estimated fare</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Enter pickup and drop locations to see available vehicles and fares
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Book Button */}
      {estimatesData?.estimates && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const selectedEstimate = estimatesData.estimates.find(
                e => e.vehicleType === formData.vehicleType
              )
              if (selectedEstimate) {
                handleBookRide(formData.vehicleType, selectedEstimate.fare)
              }
            }}
            disabled={loading || !formData.pickupLocation.address || !formData.dropLocation.address}
            className="btn btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Booking...' : 'Book Ride'}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
          <p className="text-gray-600 text-sm">
            No hidden charges. See your fare before you book.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Multiple Options</h3>
          <p className="text-gray-600 text-sm">
            Choose from various vehicle types to suit your needs.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Quick Booking</h3>
          <p className="text-gray-600 text-sm">
            Book your ride in seconds with our simple interface.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CabBooking
