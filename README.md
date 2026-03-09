# Ucab - Full-Stack Cab Booking Application

A modern, feature-rich cab booking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Ucab provides a seamless ride-hailing experience for users, drivers, and administrators with real-time tracking, secure payments, and comprehensive management features.

## 🚀 Features

### User Features
- **User Registration & Login** - Secure authentication with JWT
- **Profile Management** - Update personal information and preferences
- **Cab Booking** - Book rides with real-time fare estimation
- **Live Ride Tracking** - Track your ride in real-time
- **Multiple Vehicle Types** - Choose from sedans, SUVs, hatchbacks, luxury cars, and auto-rickshaws
- **Ride History** - View complete ride history with receipts
- **Secure Payments** - Multiple payment options (cash, card, wallet)
- **Rating System** - Rate drivers and provide feedback

### Driver Features
- **Driver Registration** - Complete verification process
- **Document Upload** - Upload license and vehicle documents
- **Availability Toggle** - Go online/offline instantly
- **Ride Management** - Accept, reject, and manage rides
- **Real-time Location Updates** - Share location with passengers
- **Earnings Dashboard** - Track daily, weekly, and monthly earnings
- **Ride History** - View completed rides and payments

### Admin Features
- **Dashboard Analytics** - Comprehensive system statistics
- **User Management** - View, block, and manage users
- **Driver Management** - Approve drivers and manage documents
- **Ride Monitoring** - Monitor all rides in real-time
- **Payment Tracking** - View and manage all transactions
- **System Reports** - Generate detailed reports

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Query** - Data fetching
- **React Hook Form** - Form management

### Development Tools
- **Vite** - Build tool
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
ucab-project/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/            # Route controllers (if needed)
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── errorHandler.js    # Error handling middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Driver.js          # Driver model
│   │   ├── Ride.js            # Ride model
│   │   └── Payment.js         # Payment model
│   ├── routes/
│   │   ├── userRoutes.js      # User routes
│   │   ├── driverRoutes.js    # Driver routes
│   │   ├── rideRoutes.js      # Ride routes
│   │   └── paymentRoutes.js   # Payment routes
│   ├── utils/
│   │   └── helpers.js         # Utility functions
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   └── Footer.jsx     # Footer component
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Home page
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Signup.jsx     # Signup page
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   ├── CabBooking.jsx
│   │   │   ├── RideTracking.jsx
│   │   │   ├── RideHistory.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   ├── api.js         # API service
│   │   │   └── socketService.js # Socket service
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ucab-project/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ucab
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

4. **Start the backend server**
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ucab-project/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String (unique),
  role: String (user/admin),
  profilePicture: String,
  isBlocked: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Drivers Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String (unique),
  vehicleType: String,
  vehicleNumber: String,
  vehicleModel: String,
  vehicleColor: String,
  licenseNumber: String (unique),
  availability: Boolean,
  currentLocation: [Number], // GeoJSON coordinates
  isApproved: Boolean,
  isBlocked: Boolean,
  rating: Number,
  totalRides: Number,
  totalEarnings: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Rides Collection
```javascript
{
  userId: ObjectId,
  driverId: ObjectId,
  pickupLocation: {
    address: String,
    coordinates: [Number] // GeoJSON
  },
  dropLocation: {
    address: String,
    coordinates: [Number] // GeoJSON
  },
  vehicleType: String,
  fare: Number,
  distance: Number,
  duration: Number,
  status: String, // pending/accepted/arriving/in_progress/completed/cancelled
  paymentStatus: String,
  paymentMethod: String,
  startTime: Date,
  endTime: Date,
  otp: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  rideId: ObjectId,
  userId: ObjectId,
  driverId: ObjectId,
  amount: Number,
  paymentMethod: String,
  paymentStatus: String,
  transactionId: String,
  commission: Number,
  driverEarnings: Number,
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/update` - Update user profile
- `GET /api/users/ride-history` - Get user ride history

### Driver Routes
- `POST /api/drivers/register` - Register new driver
- `POST /api/drivers/login` - Driver login
- `GET /api/drivers/profile` - Get driver profile
- `PUT /api/drivers/update` - Update driver profile
- `PUT /api/drivers/availability` - Update availability
- `PUT /api/drivers/location` - Update location
- `GET /api/drivers/ride-history` - Get driver ride history
- `GET /api/drivers/earnings` - Get driver earnings

### Ride Routes
- `POST /api/rides/book` - Book a new ride
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id/accept` - Accept ride (driver)
- `PUT /api/rides/:id/status` - Update ride status
- `POST /api/rides/estimate` - Get fare estimate
- `GET /api/rides/active/:userId` - Get active ride for user
- `GET /api/rides/driver/active/:driverId` - Get active ride for driver

### Payment Routes
- `POST /api/payments/create` - Create payment
- `GET /api/payments/:rideId` - Get payment details
- `POST /api/payments/process-card` - Process card payment
- `POST /api/payments/refund` - Refund payment
- `GET /api/payments/history/:userId` - Get user payment history
- `GET /api/payments/driver/history/:driverId` - Get driver payment history

## 🔄 Real-time Features

The application uses Socket.io for real-time communication:

### Events
- **new-ride-request** - Sent to nearby drivers when a user books a ride
- **ride-accepted** - Sent to user when driver accepts ride
- **ride-status-updated** - Sent when ride status changes
- **driver-location-update** - Real-time driver location updates
- **payment-successful** - Sent when payment is completed

### Usage Example
```javascript
// Client-side
import socketService from './services/socketService'

// Connect with auth token
socketService.connect(token)

// Listen for ride updates
socketService.on('ride-status-updated', (data) => {
  console.log('Ride status updated:', data)
})

// Join ride room for real-time updates
socketService.joinRoom(rideId)
```

## 🧪 Testing

### API Testing with Postman

1. **Import the collection** (provided in `docs/postman-collection.json`)
2. **Set environment variables**:
   - `base_url`: `http://localhost:5000`
   - `token`: Get from login response

### Sample Test Data

**User Registration:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Driver Registration:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "0987654321",
  "vehicleType": "sedan",
  "vehicleNumber": "ABC-1234",
  "vehicleModel": "Toyota Camry",
  "vehicleColor": "White",
  "licenseNumber": "DL123456"
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - Prevent API abuse
- **CORS Configuration** - Cross-origin resource sharing setup
- **Helmet.js** - Security headers
- **Role-based Access Control** - User, driver, and admin roles

## 🚀 Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Netlify/Vercel)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@ucab.com
- Create an issue on GitHub
- Check the [FAQ](docs/FAQ.md)

## 🎉 Acknowledgments

- React team for the amazing framework
- MongoDB for the excellent database
- Socket.io for real-time communication
- Tailwind CSS for the beautiful styling
- All contributors and users of Ucab

---

**Ucab - Your Ride, Your Way! 🚗**
