# API Documentation for Ucab

This document provides detailed information about all available API endpoints in the Ucab cab booking application.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## User Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

### User Login
Authenticate a user and get JWT token.

**Endpoint:** `POST /users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

### Get User Profile
Get current user's profile information.

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "profilePicture": "",
    "emailVerified": true,
    "createdAt": "2023-07-20T10:30:00.000Z"
  }
}
```

### Update User Profile
Update current user's profile information.

**Endpoint:** `PUT /users/update`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "1234567890",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

### Get User Ride History
Get user's ride history with pagination.

**Endpoint:** `GET /users/ride-history`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "rides": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "driverId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "pickupLocation": {
        "address": "123 Main St",
        "coordinates": [77.2090, 28.6139]
      },
      "dropLocation": {
        "address": "456 Oak Ave",
        "coordinates": [77.2190, 28.6239]
      },
      "vehicleType": "sedan",
      "fare": 25.50,
      "status": "completed",
      "createdAt": "2023-07-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## Driver Endpoints

### Register Driver
Create a new driver account.

**Endpoint:** `POST /drivers/register`

**Request Body:**
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
  "licenseNumber": "DL123456789",
  "licenseDocument": "https://example.com/license.jpg",
  "vehicleDocument": "https://example.com/vehicle.jpg"
}
```

### Driver Login
Authenticate a driver and get JWT token.

**Endpoint:** `POST /drivers/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Get Driver Profile
Get current driver's profile information.

**Endpoint:** `GET /drivers/profile`

**Headers:** `Authorization: Bearer <token>`

### Update Driver Availability
Toggle driver availability status.

**Endpoint:** `PUT /drivers/availability`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "availability": true
}
```

### Update Driver Location
Update driver's current location.

**Endpoint:** `PUT /drivers/location`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### Get Driver Earnings
Get driver's earnings statistics.

**Endpoint:** `GET /drivers/earnings`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "earnings": {
    "total": 1250.75,
    "today": 85.50,
    "thisWeek": 425.25,
    "thisMonth": 1250.75
  }
}
```

---

## Ride Endpoints

### Book Ride
Book a new ride.

**Endpoint:** `POST /rides/book`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pickupLocation": {
    "address": "123 Main St",
    "coordinates": [77.2090, 28.6139]
  },
  "dropLocation": {
    "address": "456 Oak Ave",
    "coordinates": [77.2190, 28.6239]
  },
  "vehicleType": "sedan",
  "paymentMethod": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride booked successfully. Waiting for driver acceptance.",
  "ride": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "pickupLocation": {
      "address": "123 Main St",
      "coordinates": [77.2090, 28.6139]
    },
    "dropLocation": {
      "address": "456 Oak Ave",
      "coordinates": [77.2190, 28.6239]
    },
    "vehicleType": "sedan",
    "fare": 25.50,
    "status": "pending",
    "otp": "123456"
  }
}
```

### Get Ride Details
Get details of a specific ride.

**Endpoint:** `GET /rides/:id`

**Headers:** `Authorization: Bearer <token>`

### Accept Ride
Accept a ride (driver only).

**Endpoint:** `PUT /rides/:id/accept`

**Headers:** `Authorization: Bearer <token>`

### Update Ride Status
Update the status of a ride.

**Endpoint:** `PUT /rides/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "in_progress",
  "reason": "Starting ride"
}
```

### Get Fare Estimate
Get fare estimate for a route.

**Endpoint:** `POST /rides/estimate`

**Request Body:**
```json
{
  "pickupLocation": {
    "coordinates": [77.2090, 28.6139]
  },
  "dropLocation": {
    "coordinates": [77.2190, 28.6239]
  }
}
```

**Response:**
```json
{
  "success": true,
  "distance": 5.2,
  "duration": 15,
  "estimates": [
    {
      "vehicleType": "sedan",
      "fare": 25.50,
      "breakdown": {
        "baseFare": 5.00,
        "distanceFare": 7.80,
        "timeFare": 4.50,
        "totalFare": 25.50,
        "surgeMultiplier": 1.0
      }
    }
  ]
}
```

---

## Payment Endpoints

### Create Payment
Create a payment for a completed ride.

**Endpoint:** `POST /payments/create`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rideId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "paymentMethod": "card",
  "amount": 25.50
}
```

### Get Payment Details
Get payment details for a ride.

**Endpoint:** `GET /payments/:rideId`

**Headers:** `Authorization: Bearer <token>`

### Process Card Payment
Process a card payment.

**Endpoint:** `POST /payments/process-card`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "cardNumber": "4242424242424242",
  "expiryMonth": "12",
  "expiryYear": "25",
  "cvv": "123",
  "cardholderName": "John Doe"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per 15 minutes per IP address
- Authentication endpoints have stricter limits

## WebSocket Events

The application uses Socket.io for real-time communication:

### Client Events
- `join-room` - Join a room for real-time updates
- `leave-room` - Leave a room
- `driver-location-update` - Update driver location

### Server Events
- `new-ride-request` - New ride request for drivers
- `ride-accepted` - Ride accepted by driver
- `ride-status-updated` - Ride status changed
- `payment-successful` - Payment completed

## Testing with Postman

1. Import the provided Postman collection
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Get from login response
3. Use the collection to test all endpoints

For more detailed testing examples, see the [Testing Guide](TESTING.md).
