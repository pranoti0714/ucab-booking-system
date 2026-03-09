import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Car, MapPin, Clock, Star, TrendingUp, DollarSign } from 'lucide-react'
import axios from 'axios'

const UserDashboard = () => {
  const [activeRide, setActiveRide] = useState(null)

  const { data: rideHistory, isLoading: historyLoading } = useQuery(
    'rideHistory',
    async () => {
      const response = await axios.get('/api/users/ride-history?limit=5')
      return response.data.rides
    }
  )

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const response = await axios.get('/api/rides/active/me')
        setActiveRide(response.data.ride)
      } catch (error) {
        // No active ride
      }
    }
    fetchActiveRide()
  }, [])

  const stats = [
    {
      label: 'Total Rides',
      value: rideHistory?.length || 0,
      icon: Car,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Spent',
      value: `$${rideHistory?.reduce((sum, ride) => sum + (ride.fare || 0), 0).toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Avg Rating',
      value: '4.8',
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      label: 'Member Since',
      value: new Date().toLocaleDateString(),
      icon: Clock,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your rides today.</p>
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
              href={`/ride/${activeRide._id}`}
              className="btn btn-primary"
            >
              Track Ride
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
                      {ride.driverId && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{ride.driverId.name}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{ride.driverId.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <a
                  href="/history"
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
              <p className="text-gray-500 mb-4">Book your first ride to get started!</p>
              <a
                href="/booking"
                className="btn btn-primary"
              >
                Book a Ride
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/booking"
              className="flex items-center space-x-3 text-primary-600 hover:text-primary-500"
            >
              <Car className="h-5 w-5" />
              <span>Book a Ride</span>
            </a>
            <a
              href="/history"
              className="flex items-center space-x-3 text-primary-600 hover:text-primary-500"
            >
              <Clock className="h-5 w-5" />
              <span>View Ride History</span>
            </a>
            <a
              href="/profile"
              className="flex items-center space-x-3 text-primary-600 hover:text-primary-500"
            >
              <Star className="h-5 w-5" />
              <span>Update Profile</span>
            </a>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Have questions or need assistance with your rides?
          </p>
          <div className="space-y-2">
            <a
              href="/support"
              className="block text-primary-600 hover:text-primary-500"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="block text-primary-600 hover:text-primary-500"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
