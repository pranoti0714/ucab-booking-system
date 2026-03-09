# Ucab Installation Guide

This guide will help you set up the Ucab cab booking application on your local machine for development and testing.

## System Requirements

- **Node.js**: Version 14.0 or higher
- **npm**: Version 6.0 or higher (comes with Node.js)
- **MongoDB**: Version 4.4 or higher
- **Git**: For cloning the repository

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ucab-project.git
cd ucab-project
```

## Step 2: Install MongoDB

### Option A: Install MongoDB locally

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option B: Use MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Use this connection string in your environment variables

## Step 3: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit the `.env` file:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/ucab
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ucab

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d

   # Optional: Payment Gateway (Stripe)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

   # Optional: Email Service (SendGrid)
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_sendgrid_api_key

   # Optional: Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

5. **Start the backend server:**
   ```bash
   # For development with auto-restart
   npm run dev

   # For production
   npm start
   ```

6. **Verify the backend is running:**
   Open your browser and go to `http://localhost:5000`. You should see:
   ```json
   {"message": "Ucab API Server is running"}
   ```

## Step 4: Frontend Setup

1. **Open a new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## Step 5: Create Initial Data (Optional)

To test the application with sample data, you can create some initial records:

### Create Test Users

1. **Register a test user:**
   - Go to `http://localhost:3000/signup`
   - Fill in the user registration form
   - Or use the API directly:
   ```bash
   curl -X POST http://localhost:5000/api/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "phone": "1234567890"
     }'
   ```

2. **Register a test driver:**
   ```bash
   curl -X POST http://localhost:5000/api/drivers/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Driver",
       "email": "driver@example.com",
       "password": "password123",
       "phone": "0987654321",
       "vehicleType": "sedan",
       "vehicleNumber": "TEST-1234",
       "vehicleModel": "Toyota Camry",
       "vehicleColor": "Blue",
       "licenseNumber": "DL123456789",
       "licenseDocument": "placeholder_url",
       "vehicleDocument": "placeholder_url"
     }'
   ```

## Step 6: Test the Application

### Test User Flow
1. Go to `http://localhost:3000`
2. Click "Sign Up" and create a user account
3. Login with your credentials
4. Navigate to "Book Ride" and try booking a cab
5. Check your ride history

### Test Driver Flow
1. Go to `http://localhost:3000`
2. Click "Sign Up" and select "Driver"
3. Fill in all driver information
4. Login with driver credentials
5. Toggle your availability to "Online"
6. Wait for ride requests (you'll need to book a ride as a user)

## Common Issues and Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Make sure MongoDB is running (`mongod` command)
- Check your MONGODB_URI in the .env file
- Verify MongoDB is accessible at the specified port

### Issue: Port Already in Use
**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change the port in .env file
PORT=5001
```

### Issue: Frontend Not Connecting to Backend
**Solution:**
- Make sure the backend server is running on port 5000
- Check the proxy configuration in `vite.config.js`
- Verify CORS settings in the backend

### Issue: JWT Token Errors
**Solution:**
- Make sure JWT_SECRET is set in your .env file
- Clear browser localStorage if you have old tokens
- Restart the backend server after changing environment variables

## Development Workflow

### Making Changes
1. **Backend changes:** The server will auto-restart with `npm run dev`
2. **Frontend changes:** The browser will auto-reload with `npm run dev`

### Database Management
```bash
# Connect to MongoDB shell
mongo ucab

# View collections
show collections

# View users
db.users.find().pretty()

# Clear all data (for testing)
db.users.deleteMany({})
db.drivers.deleteMany({})
db.rides.deleteMany({})
db.payments.deleteMany({})
```

### Logging and Debugging
- Backend logs appear in the terminal where `npm run dev` is running
- Check browser console for frontend errors
- Use browser DevTools Network tab to inspect API calls

## Production Deployment Notes

When deploying to production:

1. **Environment Variables:** Set all production environment variables
2. **Database:** Use MongoDB Atlas or a production MongoDB instance
3. **HTTPS:** Configure SSL/TLS certificates
4. **Build:** Run `npm run build` for frontend production build
5. **Process Manager:** Use PM2 or similar for backend process management

## Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed
5. Review the [FAQ](FAQ.md) for common questions

For additional support:
- Create an issue on GitHub
- Email: support@ucab.com
- Check the documentation in the `/docs` folder

Happy coding with Ucab! 🚗
