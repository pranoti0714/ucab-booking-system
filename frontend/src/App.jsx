import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import DriverDashboard from './pages/DriverDashboard'
import CabBooking from './pages/CabBooking'
import RideTracking from './pages/RideTracking'
import RideHistory from './pages/RideHistory'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={user?.role === 'user' ? <UserDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/booking" 
            element={user?.role === 'user' ? <CabBooking /> : <Navigate to="/" />} 
          />
          <Route 
            path="/ride/:id" 
            element={user?.role === 'user' ? <RideTracking /> : <Navigate to="/" />} 
          />
          <Route 
            path="/history" 
            element={user?.role === 'user' ? <RideHistory /> : <Navigate to="/" />} 
          />
          
          {/* Driver Routes */}
          <Route 
            path="/driver/dashboard" 
            element={user?.role === 'driver' ? <DriverDashboard /> : <Navigate to="/" />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          
          {/* Profile Routes */}
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
