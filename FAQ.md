# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is Ucab?
A: Ucab is a full-stack cab booking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It allows users to book rides, drivers to manage their work, and administrators to oversee the entire system.

### Q: Is Ucab free to use?
A: Yes, Ucab is open-source and free to use. You can deploy it on your own servers without any licensing fees.

### Q: What are the system requirements?
A: You need Node.js 14+, MongoDB 4.4+, and npm 6+. For detailed requirements, see the [Installation Guide](INSTALL.md).

---

## Installation & Setup

### Q: How do I install Ucab?
A: Follow the step-by-step installation guide in the [INSTALL.md](INSTALL.md) file. The process involves cloning the repository, installing dependencies, setting up MongoDB, and configuring environment variables.

### Q: I'm getting a MongoDB connection error. What should I do?
A: 
1. Ensure MongoDB is running (`mongod` command)
2. Check your MONGODB_URI in the .env file
3. Verify MongoDB is accessible at the specified port
4. Try using MongoDB Atlas if local installation fails

### Q: The backend server won't start. What's wrong?
A: Common issues:
- Port 5000 is already in use
- Missing environment variables
- MongoDB connection issues
- Missing dependencies (run `npm install`)

### Q: Frontend is not connecting to the backend. How to fix?
A: 
1. Ensure backend is running on port 5000
2. Check the proxy configuration in `vite.config.js`
3. Verify CORS settings in the backend
4. Check browser console for specific error messages

---

## Usage & Features

### Q: How do I book a ride?
A: 
1. Register/login as a user
2. Go to the "Book Ride" page
3. Enter pickup and drop locations
4. Select vehicle type
5. Confirm booking

### Q: How do drivers receive ride requests?
A: Drivers need to:
1. Register and get approved by admin
2. Set their availability to "Online"
3. They'll receive real-time notifications for nearby ride requests

### Q: Can I track my ride in real-time?
A: Yes! Once a ride is accepted, you can track it on the ride tracking page. The driver's location updates in real-time.

### Q: What payment methods are supported?
A: Currently supported:
- Cash (pay driver directly)
- Card (processed through payment gateway)
- Wallet (in-app balance - future feature)

### Q: How is fare calculated?
A: Fare is calculated based on:
- Base fare (varies by vehicle type)
- Distance traveled
- Time spent in traffic
- Surge pricing during peak hours

---

## Technical Questions

### Q: What technologies are used in Ucab?
A: 
- **Backend**: Node.js, Express.js, MongoDB, Socket.io
- **Frontend**: React.js, Tailwind CSS, Vite
- **Authentication**: JWT tokens
- **Real-time**: Socket.io for live updates

### Q: How does real-time tracking work?
A: Ucab uses Socket.io for real-time communication:
- Drivers update their location periodically
- Users receive live location updates
- Ride status changes are broadcast instantly
- All updates happen in real-time

### Q: Is the application secure?
A: Yes, Ucab includes several security features:
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet.js

### Q: Can I customize the application?
A: Absolutely! Ucab is open-source. You can:
- Modify the UI/UX
- Add new features
- Integrate different payment gateways
- Customize fare calculation algorithms
- Add new vehicle types

---

## Troubleshooting

### Q: I'm getting "Invalid token" errors.
A: 
1. Clear your browser localStorage
2. Login again to get a fresh token
3. Check that the token is being sent in Authorization headers
4. Verify JWT_SECRET is set in backend .env

### Q: The application is very slow. How to improve performance?
A: 
1. Ensure you're using the latest Node.js version
2. Add proper indexing to MongoDB collections
3. Implement caching for frequently accessed data
4. Use CDN for static assets in production
5. Optimize images and assets

### Q: Drivers are not receiving ride requests.
A: 
1. Ensure drivers are set to "Online" status
2. Check if drivers are within the search radius
3. Verify Socket.io connection is working
4. Check browser console for WebSocket errors

### Q: Payments are failing. What to check?
A: 
1. Verify payment gateway credentials
2. Check if payment gateway is accessible
3. Ensure proper error handling in payment processing
4. Check network connectivity

---

## Deployment

### Q: How do I deploy Ucab to production?
A: See the deployment section in the main README.md. Key steps:
1. Set up production database (MongoDB Atlas recommended)
2. Configure environment variables
3. Build frontend (`npm run build`)
4. Deploy backend to cloud platform (Heroku, AWS, etc.)
5. Deploy frontend to static hosting (Netlify, Vercel, etc.)

### Q: Can I use Docker for deployment?
A: Yes! You can create Docker containers for both frontend and backend. This is recommended for production deployments.

### Q: Do I need SSL certificates?
A: Yes, for production deployment, you should:
- Use HTTPS for all API endpoints
- Configure SSL/TLS certificates
- Use secure WebSocket connections (WSS)

---

## Development

### Q: How can I contribute to Ucab?
A: 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Q: Are there any coding standards I should follow?
A: Yes, please follow:
- ESLint configuration provided
- Use meaningful variable names
- Add comments for complex logic
- Follow React best practices
- Write clean, maintainable code

### Q: How do I add new features?
A: 
1. Plan the feature (database schema, API endpoints, UI components)
2. Implement backend changes first
3. Add frontend components
4. Update routing
5. Test thoroughly
6. Update documentation

---

## Support

### Q: Where can I get help if I'm stuck?
A: 
- Check this FAQ first
- Read the detailed documentation
- Search existing GitHub issues
- Create a new issue with detailed information
- Email: support@ucab.com

### Q: I found a bug. How do I report it?
A: 
1. Check if it's already reported
2. Create a new GitHub issue
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages/screenshots

### Q: Can I request new features?
A: Yes! Please create a GitHub issue with:
- Feature description
- Use case
- Expected benefits
- Implementation suggestions (if any)

---

## Legal & Business

### Q: Can I use Ucab for commercial purposes?
A: Yes, Ucab is licensed under MIT, which allows commercial use. However, you should:
- Comply with local transportation regulations
- Ensure proper insurance coverage
- Follow data protection laws (GDPR, etc.)

### Q: Do I need to handle taxes and legal compliance?
A: Yes, if you're operating a real cab service, you need to:
- Register your business
- Handle taxes appropriately
- Comply with local transportation laws
- Ensure driver and passenger safety
- Handle insurance requirements

---

Still have questions? Feel free to reach out to our community or create an issue on GitHub!
