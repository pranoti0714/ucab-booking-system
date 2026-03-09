import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MapPin, Phone, MessageSquare, Star, Clock, Car, Navigation } from 'lucide-react'
import axios from 'axios'

const RideTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rideStatus, setRideStatus] = useState(null)

  const { data: ride, isLoading, refetch } = useQuery(
    ['ride', id],
    async () => {
      const response = await axios.get(`/api/rides/${id}`)
      return response.data.ride
    },
    {
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  )

  useEffect(() => {
    if (ride) {
      setRideStatus(ride.status)
    }
  }, [ride])

  const handleCancelRide = async () => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        await axios.put(`/api/rides/${id}/status`, {
          status: 'cancelled',
          reason: 'Customer cancelled'
        })
        navigate('/dashboard')
      } catch (error) {
        console.error('Failed to cancel ride:', error)
        alert('Failed to cancel ride. Please try again.')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'arriving':
        return 'bg-purple-100 text-purple-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for driver'
      case 'accepted':
        return 'Driver assigned'
      case 'arriving':
        return 'Driver on the way'
      case 'in_progress':
        return 'Ride in progress'
      case 'completed':
        return 'Ride completed'
      case 'cancelled':
        return 'Ride cancelled'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ride not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Ride Tracking</h1>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
              {getStatusText(ride.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="card h-96 lg:h-full min-h-96">
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Live Map</h3>
                  <p className="text-gray-500">
                    {ride.status === 'pending' && 'Waiting for driver assignment...'}
                    {ride.status === 'accepted' && 'Driver assigned. Map loading...'}
                    {ride.status === 'arriving' && 'Driver is on the way!'}
                    {ride.status === 'in_progress' && 'Ride in progress'}
                    {ride.status === 'completed' && 'Ride completed'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="space-y-6">
            {/* Driver Info */}
            {ride.driverId && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-600">
                      {ride.driverId.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{ride.driverId.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{ride.driverId.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {ride.driverId.vehicleColor} {ride.driverId.vehicleModel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Plate:</span>
                    <span className="text-gray-600">{ride.driverId.vehicleNumber}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 btn btn-outline flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </button>
                  <button className="flex-1 btn btn-outline flex items-center justify-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            )}

            {/* Route Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pickup</p>
                    <p className="text-sm text-gray-600">{ride.pickupLocation.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Drop</p>
                    <p className="text-sm text-gray-600">{ride.dropLocation.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Distance</p>
                    <p className="font-semibold">{ride.distance} km</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold">{ride.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fare</p>
                    <p className="font-semibold text-lg text-primary-600">${ride.fare}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p className="font-semibold capitalize">{ride.vehicleType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP */}
            {ride.status === 'in_progress' && ride.otp && (
              <div className="card p-6 bg-primary-50 border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Share OTP with Driver</h3>
                <div className="text-3xl font-bold text-primary-600 text-center py-2">
                  {ride.otp}
                </div>
                <p className="text-sm text-primary-700 text-center">
                  Please share this OTP with your driver to start the ride
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {ride.status === 'pending' && (
                <button
                  onClick={handleCancelRide}
                  className="w-full btn btn-outline text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Cancel Ride
                </button>
              )}
              
              {ride.status === 'completed' && (
                <div className="text-center space-y-3">
                  <div className="text-green-600 font-semibold">Ride Completed!</div>
                  <button className="w-full btn btn-primary">
                    Book Another Ride
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RideTracking
