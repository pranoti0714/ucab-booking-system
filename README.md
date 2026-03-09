# Ucab - Full Stack Cab Booking Application

Ucab is a modern cab booking application built using the MERN stack (MongoDB, Express.js, React.js, Node.js).  
It allows users to book rides, drivers to accept and manage rides, and admins to monitor the platform.

---

## 🚀 Features

### User Features
- User registration and login
- Book cab rides
- Track rides
- View ride history
- Rate drivers

### Driver Features
- Driver registration
- Accept or reject rides
- Update ride status
- View earnings
- Real-time location updates

### Admin Features
- Dashboard analytics
- Manage users and drivers
- Monitor rides
- Track payments

---

## 🛠 Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS

### Tools
- Vite
- PostCSS
- Autoprefixer

---

## 📁 Project Structure
ucab-project
│
├── backend
│ ├── config
│ │ └── database.js
│ ├── controllers
│ ├── middleware
│ │ ├── auth.js
│ │ └── errorHandler.js
│ ├── models
│ │ ├── User.js
│ │ ├── Driver.js
│ │ ├── Ride.js
│ │ └── Payment.js
│ ├── routes
│ │ ├── userRoutes.js
│ │ ├── driverRoutes.js
│ │ ├── rideRoutes.js
│ │ └── paymentRoutes.js
│ ├── utils
│ │ └── helpers.js
│ └── server.js
│
├── frontend
│ ├── public
│ │ └── index.html
│ ├── src
│ │ ├── components
│ │ │ ├── Navbar.jsx
│ │ │ └── Footer.jsx
│ │ ├── pages
│ │ │ ├── Home.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Signup.jsx
│ │ │ ├── CabBooking.jsx
│ │ │ ├── RideTracking.jsx
│ │ │ ├── RideHistory.jsx
│ │ │ ├── UserDashboard.jsx
│ │ │ ├── DriverDashboard.jsx
│ │ │ └── AdminDashboard.jsx
│ │ ├── services
│ │ │ └── api.js
│ │ ├── context
│ │ │ └── AuthContext.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ ├── vite.config.js
│ ├── tailwind.config.js
│ └── postcss.config.js
│
└── README.md


---

## ⚙️ Installation

### Clone the repository

git clone https://github.com/pranoti0714/ucab-booking-system.git


---

## Backend Setup

Navigate to backend folder

Install dependencies

Create `.env` file

Start backend server

---

## Frontend Setup

Navigate to frontend folder


Install dependencies

Run frontend

---

## Database Collections

### Users
- name
- email
- password
- phone
- role
- createdAt

### Drivers
- name
- email
- phone
- vehicleType
- vehicleNumber
- licenseNumber
- rating

### Rides
- userId
- driverId
- pickupLocation
- dropLocation
- fare
- status
- startTime
- endTime

### Payments
- rideId
- amount
- paymentMethod
- paymentStatus
- transactionId

---

## API Endpoints

### User
POST /api/users/register
POST /api/users/login
GET /api/users/profile


### Driver


POST /api/drivers/register
POST /api/drivers/login
GET /api/drivers/profile


### Ride


POST /api/rides/book
GET /api/rides/:id
PUT /api/rides/:id/status


---

## Security

- JWT Authentication
- Password hashing with bcrypt
- Input validation
- Role-based access control

---

## Deployment

Backend can be deployed on:
- Render
- Heroku

Frontend can be deployed on:
- Vercel
- Netlify

---

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Create pull request

---

## License

MIT License

---

## Acknowledgements

- React
- MongoDB
- Express
- Tailwind CSS

---

🚖 **Ucab – Your Ride, Your Way**