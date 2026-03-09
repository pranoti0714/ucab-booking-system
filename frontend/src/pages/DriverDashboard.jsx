import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Car, MapPin, DollarSign, ToggleLeft, ToggleRight, Star, TrendingUp } from 'lucide-react'
import axios from 'axios'

const DriverDashboard = () => {
  const [availability, setAvailability] = useState(false)
  const [activeRide, setActiveRide] = useState(null)

  const { data: earnings, isLoading: earningsLoading } = useQuery(
    'driverEarnings',
    async () => {
      const response = await axios.get('/api/drivers/earnings')
      return response.data.earnings
    }
  )

  const { data: rideHistory, isLoading: historyLoading } = useQuery(
    'driverRideHistory',
    async () => {
      const response = await axios.get('/api/drivers/ride-history?limit=5')
      return response.data.rides
    }
  )

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const response = await axios.get('/api/drivers/profile')
        setAvailability(response.data.driver.availability)
      } catch (error) {
        console.error('Failed to fetch driver profile:', error)
      }
    }
    fetchDriverProfile()
  }, [])

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const response = await axios.get('/api/rides/driver/active/me')
        setActiveRide(response.data.ride)
      } catch (error) {
        // No active ride
      }
    }
    fetchActiveRide()
  }, [])

  const toggleAvailability = async () => {
    try {
      const newAvailability = !availability
      await axios.put('/api/drivers/availability', { availability: newAvailability })
      setAvailability(newAvailability)
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  const stats = [
    {
      label: 'Total Earnings',
      value: `$${earnings?.total?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Today\'s Earnings',
      value: `$${earnings?.today?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Rides',
      value: rideHistory?.length || 0,
      icon: Car,
      color: 'bg-purple-500'
    },
    {
      label: 'Your Rating',
      value: '4.8',
      icon: Star,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your rides and earnings</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {availability ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={toggleAvailability}
                className="p-1"
              >
                {availability ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Ride */}
      {activeRide && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-2">Active Ride</h2>
              <div className="flex items-center space-x-4 text-primary-700">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {activeRide.pickupLocation?.address}
                  </span>
                </div>
                <span>→</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {activeRide.dropLocation?.address}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {activeRide.status}
                </span>
              </div>
            </div>
            <a
              href={`/driver/ride/${activeRide._id}`}
              className="btn btn-primary"
            >
              Manage Ride
            </a>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Rides */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Rides</h2>
        </div>
        <div className="p-6">
          {historyLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading ride history...</p>
            </div>
          ) : rideHistory && rideHistory.length > 0 ? (
            <div className="space-y-4">
              {rideHistory.map((ride) => (
                <div key={ride._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {ride.vehicleType}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {ride.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ride.pickupLocation?.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{ride.dropLocation?.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-gray-900">${ride.fare}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {ride.userId && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{ride.userId.name}</p>
                          <p className="text-xs text-gray-500">{ride.userId.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <a
                  href="/driver/history"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View all rides →
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides yet</h3>
              <p className="text-gray-500 mb-4">
                {availability ? 'Waiting for ride requests...' : 'Go online to start receiving rides!'}
              </p>
              {!availability && (
                <button
                  onClick={toggleAvailability}
                  className="btn btn-primary"
                >
                  Go Online
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today</h3>
          <p className="text-2xl font-bold text-green-600">
            ${earnings?.today?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Earned today</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${earnings?.thisWeek?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Earned this week</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${earnings?.thisMonth?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Earned this month</p>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard
