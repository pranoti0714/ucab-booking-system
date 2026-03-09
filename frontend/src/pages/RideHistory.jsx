import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Car, MapPin, Calendar, DollarSign, Star, Download, Filter } from 'lucide-react'
import axios from 'axios'

const RideHistory = () => {
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: rideHistoryData, isLoading } = useQuery(
    ['rideHistory', currentPage, filter],
    async () => {
      const response = await axios.get(`/api/users/ride-history?page=${currentPage}&limit=10`)
      return response.data
    }
  )

  const handleDownloadReceipt = async (rideId) => {
    try {
      // In a real app, this would generate and download a PDF receipt
      const response = await axios.get(`/api/payments/${rideId}`)
      const payment = response.data.payment
      
      // Create a simple text receipt
      const receipt = `
UCAB RIDE RECEIPT
==================
Ride ID: ${rideId}
Date: ${new Date(payment.paymentDate).toLocaleDateString()}
Time: ${new Date(payment.paymentDate).toLocaleTimeString()}
Amount: $${payment.amount}
Payment Method: ${payment.paymentMethod}
Status: ${payment.paymentStatus}
Transaction ID: ${payment.transactionId}

Thank you for riding with Ucab!
      `
      
      const blob = new Blob([receipt], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ucab-receipt-${rideId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download receipt:', error)
      alert('Failed to download receipt')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRides = rideHistoryData?.rides?.filter(ride => {
    if (filter === 'all') return true
    return ride.status === filter
  }) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ride History</h1>
        <p className="text-gray-600 mt-2">View and manage your past rides</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rides</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {rideHistoryData?.pagination?.total || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <Car className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${filteredRides.reduce((sum, ride) => sum + (ride.fare || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {filteredRides.filter(ride => ride.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <Star className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {filteredRides.filter(ride => ride.status === 'cancelled').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-500 bg-opacity-10">
              <Calendar className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filter Rides</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input text-sm py-1"
              >
                <option value="all">All Rides</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ride List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Rides</h2>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading ride history...</p>
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <div key={ride._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {ride.vehicleType}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="text-gray-600">{ride.pickupLocation?.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="text-gray-600">{ride.dropLocation?.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mt-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Distance:</span>
                          <span className="font-medium">{ride.distance} km</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{ride.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Fare:</span>
                          <span className="font-semibold text-primary-600">${ride.fare}</span>
                        </div>
                      </div>

                      {ride.driverId && (
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">
                              {ride.driverId.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{ride.driverId.name}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{ride.driverId.rating}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {ride.status === 'completed' && (
                        <button
                          onClick={() => handleDownloadReceipt(ride._id)}
                          className="btn btn-outline text-sm flex items-center space-x-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Receipt</span>
                        </button>
                      )}
                      <a
                        href={`/ride/${ride._id}`}
                        className="btn btn-outline text-sm"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {rideHistoryData?.pagination?.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {rideHistoryData.pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(rideHistoryData.pagination.pages, prev + 1))}
                    disabled={currentPage === rideHistoryData.pagination.pages}
                    className="btn btn-outline text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't taken any rides yet" 
                  : `No ${filter} rides found`
                }
              </p>
              <a
                href="/booking"
                className="btn btn-primary"
              >
                Book Your First Ride
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RideHistory
