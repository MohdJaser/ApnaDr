const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb+srv://MohdJaser:MohdJaser00001@cluster0.qtcwhq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.log('❌ MongoDB connection error:', err);
    console.log('⚠️  Using in-memory storage as fallback');
});

// Import Models
const Hospital = require('./models/Hospital');
const Appointment = require('./models/Appointment');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Real Telangana Government Hospitals Data with Coordinates
const telanganaHospitals = [
    // ... (your hospital data remains the same)
];

// Initialize database
async function initializeDatabase() {
    try {
        const count = await Hospital.countDocuments();
        if (count === 0) {
            await Hospital.insertMany(telanganaHospitals);
            console.log('✅ Telangana hospitals loaded into database');
        } else {
            console.log('✅ Database already contains hospitals');
        }
    } catch (error) {
        console.log('❌ Database initialization error:', error.message);
    }
}

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'apnadr.demo@gmail.com',
        pass: 'your-app-password'
    }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'ApnaDr API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Get all hospitals
app.get('/api/hospitals', async (req, res) => {
    try {
        let query = {};
        const { city, area } = req.query;
        
        if (city) {
            query.city = new RegExp(city, 'i');
        }
        if (area) {
            query.address = new RegExp(area, 'i');
        }
        
        const hospitals = await Hospital.find(query);
        res.json({
            success: true,
            data: hospitals,
            message: 'Hospitals retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Find hospitals near user's location
app.get('/api/hospitals/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        const fallbackHospitals = await Hospital.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        }).limit(10);
        return res.json({
            success: true,
            data: fallbackHospitals,
            message: `Found ${fallbackHospitals.length} fallback hospitals within ${radius}km`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// NEW: Get nearest emergency hospital
app.get('/api/hospitals/emergency/nearest', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }

        const nearestHospital = await Hospital.findOne({
            emergency: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                }
            }
        });

        if (!nearestHospital) {
            return res.status(404).json({ success: false, message: 'No emergency hospitals found' });
        }

        res.json({
            success: true,
            data: nearestHospital,
            message: 'Nearest emergency hospital retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ... (The rest of your server.js file remains the same)

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ApnaDr Backend Server running on port ${PORT}`);
    // ...
    initializeDatabase();
});

module.exports = app;
