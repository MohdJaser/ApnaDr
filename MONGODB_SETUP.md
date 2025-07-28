# MongoDB Setup Guide for ApnaDr

## **Prerequisites**

### **Option 1: Install MongoDB Locally**

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download the latest version for Windows
   - Run the installer and follow the setup wizard

2. **Start MongoDB Service:**
   ```bash
   # Start MongoDB service
   net start MongoDB
   ```

3. **Verify Installation:**
   ```bash
   # Connect to MongoDB
   mongosh
   ```

### **Option 2: Use MongoDB Atlas (Cloud - Recommended for Demo)**

1. **Create Free MongoDB Atlas Account:**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster (free tier)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Server Configuration:**
   - Replace the connection string in `server.js`:
   ```javascript
   mongoose.connect('your-mongodb-atlas-connection-string', {
       useNewUrlParser: true,
       useUnifiedTopology: true
   });
   ```

## **Quick Setup for Hackathon Demo**

### **If you don't have MongoDB installed:**

1. **Use the fallback mode** - The server will work without MongoDB for demo purposes
2. **Install MongoDB later** for full functionality

### **For Immediate Demo:**

```bash
# Install dependencies
npm install

# Start the server (will work with or without MongoDB)
npm start
```

## **Testing the Location-Based Search**

### **1. Start the Server:**
```bash
npm start
```

### **2. Test Location Search:**
- Open your website
- Click "Use My Location" button
- Allow location access in browser
- See hospitals near your actual location

### **3. Test City Search:**
- Enter "Hyderabad" or "Warangal" in the search box
- See Telangana government hospitals

### **4. Test API Endpoints:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get all hospitals
curl http://localhost:3000/api/hospitals

# Find nearby hospitals (replace with your coordinates)
curl "http://localhost:3000/api/hospitals/nearby?lat=17.3850&lng=78.4867&radius=10"
```

## **Real Telangana Hospital Data**

The system now includes **7 real government hospitals** from Telangana:

### **Hyderabad:**
1. **Osmania General Hospital** - Afzalgunj
2. **Gandhi Hospital** - Musheerabad, Secunderabad
3. **King Koti Government Hospital** - King Koti, Abids
4. **Government Maternity Hospital** - Sultan Bazar
5. **Government Chest Hospital** - Erragadda

### **Warangal:**
6. **MGM Hospital Warangal** - MGM Hospital Road

### **Ranga Reddy:**
7. **Government District Hospital Ranga Reddy** - District Hospital Road

## **Features for Judges Demo**

### **✅ Location-Based Search:**
- Real GPS coordinates for Telangana hospitals
- Find hospitals within 10km radius
- Sort by actual distance

### **✅ Real Government Data:**
- Authentic Telangana government hospitals
- Real addresses and phone numbers
- Government email domains

### **✅ Emergency Features:**
- Emergency hospital filtering
- Quick access to nearest hospitals
- Real-time location services

### **✅ Appointment Booking:**
- MongoDB-powered appointments
- Email confirmations
- Conflict detection

## **Troubleshooting**

### **MongoDB Connection Issues:**
```bash
# Check if MongoDB is running
net start MongoDB

# If not installed, the app will work in fallback mode
```

### **Port Already in Use:**
```bash
# Kill process on port 3000
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && npm start
```

### **Location Services Not Working:**
- Ensure HTTPS in production
- Allow location access in browser
- Check browser console for errors

## **For Production Deployment**

### **Environment Variables:**
```bash
# Create .env file
MONGODB_URI=your-mongodb-connection-string
PORT=3000
NODE_ENV=production
```

### **Security Considerations:**
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement proper authentication
- Add rate limiting

## **API Documentation**

### **Available Endpoints:**

1. **GET /api/health** - Health check
2. **GET /api/hospitals** - Get all hospitals
3. **GET /api/hospitals/nearby** - Find nearby hospitals (NEW!)
4. **GET /api/hospitals/:id** - Get hospital by ID
5. **GET /api/hospitals/:id/doctors** - Get doctors by hospital
6. **POST /api/appointments** - Book appointment
7. **GET /api/appointments** - Get all appointments
8. **GET /api/appointments/:id** - Get appointment by ID
9. **PUT /api/appointments/:id/cancel** - Cancel appointment
10. **GET /api/hospitals/emergency** - Get emergency hospitals

### **Location Search Example:**
```javascript
// Find hospitals within 10km of Hyderabad
fetch('/api/hospitals/nearby?lat=17.3850&lng=78.4867&radius=10')
  .then(response => response.json())
  .then(data => console.log(data));
```

## **Next Steps**

1. **Install MongoDB** for full functionality
2. **Add more Telangana hospitals** to the database
3. **Integrate with government APIs** for real-time data
4. **Add user authentication** for appointment management
5. **Implement SMS notifications** for appointments

---

**🎯 Ready for Hackathon Demo!**

Your ApnaDr application now has:
- ✅ Real Telangana government hospital data
- ✅ Location-based hospital search
- ✅ MongoDB integration
- ✅ Appointment booking system
- ✅ Emergency hospital features
- ✅ Modern, responsive UI

**Good luck with your hackathon presentation! 🚀** 