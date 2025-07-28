const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');

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
// Some hospitals near Nadargul have been added for demonstration.
const telanganaHospitals = [
    {
        name: "Aware Gleneagles Global Hospital",
        city: "Hyderabad",
        address: "8-16-1, Nagarjuna Sagar Rd, Laxmi Enclave, Bairamalguda, L.B. Nagar",
        phone: "+91 40 2411 1111",
        email: "info.lb@globalhospitalsindia.com",
        location: { type: "Point", coordinates: [78.5447, 17.3409] },
        doctors: [
            { name: "Dr. Praveen Kumar", specialization: "Cardiology", experience: "20 years", available: true },
            { name: "Dr. Sunita Reddy", specialization: "Neurology", experience: "18 years", available: true }
        ],
        facilities: ["24/7 Emergency", "ICU", "Cardiac Care", "Neurology"],
        rating: 4.7,
        emergency: true, // This is an emergency hospital
        type: "Private",
        image: "https://images.unsplash.com/photo-1612740625393-55551978a2e3?w=400"
    },
    {
        name: "Kamineni Hospitals",
        city: "Hyderabad",
        address: "L.B. Nagar, Inner Ring Road, Hyderabad, Telangana 500068",
        phone: "+91 40 3500 3500",
        email: "info@kaminenihospitals.com",
        location: { type: "Point", coordinates: [78.5492, 17.3600] },
        doctors: [
            { name: "Dr. Rajesh Varma", specialization: "Orthopedics", experience: "22 years", available: true },
            { name: "Dr. Anjali Rao", specialization: "Pediatrics", experience: "15 years", available: true }
        ],
        facilities: ["Emergency Services", "Orthopedics", "Pediatrics", "Pharmacy"],
        rating: 4.5,
        emergency: true, // This is an emergency hospital
        type: "Private",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"
    },
    {
        name: "Osmania General Hospital",
        city: "Hyderabad",
        address: "Afzal Gunj, Hyderabad, Telangana 500012",
        phone: "+91 40 2460 0121",
        email: "info@osmaniahospital.gov.in",
        location: { type: "Point", coordinates: [78.4716, 17.3734] },
        doctors: [
            { name: "Dr. Srinivas G", specialization: "General Medicine", experience: "25 years", available: true }
        ],
        facilities: ["Emergency", "Surgery", "Outpatient"],
        rating: 4.1,
        emergency: true, // This is an emergency hospital
        type: "Government",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400"
    },
    {
        name: "CURE Hospitals",
        city: "Hyderabad",
        address: "Near SRO Office, Badangpet, Hyderabad, Telangana 500058",
        phone: "+91 81 4390 0900",
        email: "contact@curehospitals.in",
        location: { type: "Point", coordinates: [78.5372, 17.3060] },
        doctors: [
            { name: "Dr. Priya Deshmukh", specialization: "Gynecology", experience: "12 years", available: true }
        ],
        facilities: ["Maternity", "General Surgery", "Pediatrics"],
        rating: 4.3,
        emergency: false, // This is NOT an emergency hospital
        type: "Private",
        image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400"
    }
];

// Initialize database with sample data if it's empty
async function initializeDatabase() {
    try {
        // IMPORTANT: For geospatial queries to work, you need to create a 2dsphere index in MongoDB.
        // You can run this command once in the mongo shell:
        // db.hospitals.createIndex({ "location": "2dsphere" })
        await Hospital.collection.createIndex({ location: "2dsphere" });

        const count = await Hospital.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Loading sample hospitals...');
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
        const nearbyHospitals = await Hospital.find({
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
            data: nearbyHospitals,
            message: `Found ${nearbyHospitals.length} fallback hospitals within ${radius}km`
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
