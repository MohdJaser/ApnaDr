# MediReach Setup Guide

## 🚀 Quick Start (Recommended)

### Option 1: Windows (Easiest)
1. **Double-click** `setup.bat` to automatically install dependencies and start the server
2. **Open** `index.html` in your web browser
3. **That's it!** Your full-stack MediReach application is running

### Option 2: Manual Setup

## 📋 Prerequisites

- **Node.js** (version 14 or higher)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (for initial dependency download)

## 🛠️ Installation Steps

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Start the Backend Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Open the Frontend

Open `index.html` in your web browser, or run:

```bash
start index.html
```

## 📁 Project Structure

```
MEDIREACH/
├── index.html          # Frontend main page
├── styles.css          # Frontend styling
├── script.js           # Frontend JavaScript (with API integration)
├── demo.html           # Presentation demo page
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
├── setup.bat           # Windows auto-setup script
├── README.md           # Project documentation
├── SETUP.md            # This setup guide
└── .gitignore          # Git ignore file
```

## 🔧 Backend Features

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/hospitals` | Get all hospitals |
| GET | `/api/hospitals/:id` | Get hospital by ID |
| GET | `/api/hospitals/:id/doctors` | Get doctors by hospital |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/:id` | Get appointment by ID |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |
| GET | `/api/hospitals/search/nearby` | Search nearby hospitals |
| GET | `/api/hospitals/emergency` | Get emergency hospitals |

### Database (In-Memory)

The backend uses in-memory storage for demo purposes:
- **Hospitals**: 5 hospitals with 15 doctors
- **Appointments**: Stored in memory during server runtime
- **Real-time validation**: Checks for conflicting appointments

## 🎯 Features Added with Backend

### 1. Real Appointment Booking
- **API Integration**: Frontend connects to backend for real booking
- **Validation**: Checks for conflicting appointments
- **Confirmation**: Generates unique appointment IDs
- **Email Notifications**: Sends confirmation emails (if configured)

### 2. Hospital Data Management
- **Dynamic Loading**: Hospitals loaded from backend API
- **Doctor Availability**: Real-time doctor availability checking
- **Fallback System**: Uses demo data if backend is unavailable

### 3. Enhanced User Experience
- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Graceful error handling with user notifications
- **Form Validation**: Server-side validation for appointments

## 🔧 Configuration

### Email Configuration (Optional)

To enable email confirmations, edit `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
});
```

### API Base URL

The frontend connects to `http://localhost:3000/api` by default. To change this, edit `script.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Node.js not installed**
   - Download from: https://nodejs.org/
   - Install and restart terminal

3. **Dependencies not installed**
   ```bash
   npm install
   ```

4. **CORS issues**
   - Backend includes CORS middleware
   - If issues persist, check browser console

### Development Mode

For development with auto-restart:

```bash
npm run dev
```

## 📱 Testing the Application

### 1. Test Hospital Search
- Open the website
- Navigate to "Find Hospital" section
- Verify hospitals load from backend

### 2. Test Appointment Booking
- Go to "Book Appointment" section
- Fill out the form
- Submit and verify appointment is created
- Check appointment confirmation modal

### 3. Test Emergency Features
- Click "Get Emergency Help"
- Verify emergency hospitals are displayed
- Test transport integration

### 4. Test API Endpoints
- Visit `http://localhost:3000/api/health`
- Should return server status

## 🎉 Success Indicators

✅ Backend server running on port 3000  
✅ Frontend loads without errors  
✅ Hospitals display correctly  
✅ Appointment booking works  
✅ Confirmation modals appear  
✅ No console errors  

## 🔄 Deployment

### For Production

1. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Email Service**: Configure real email service
3. **Hosting**: Deploy to Heroku, AWS, or similar
4. **HTTPS**: Enable SSL certificates
5. **Environment Variables**: Use proper configuration management

### For Hackathon Demo

The current setup is perfect for hackathon demos:
- ✅ Full functionality
- ✅ Real API integration
- ✅ Professional presentation
- ✅ Easy to run and demonstrate

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify Node.js is installed and up to date
3. Ensure port 3000 is available
4. Check internet connection for dependency download

---

**MediReach** - Making healthcare accessible when it matters most! 🏥🚨 