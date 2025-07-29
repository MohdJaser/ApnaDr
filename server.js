const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect('mongodb+srv://MohdJaser:MohdJaser00001@cluster0.qtcwhq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.log('❌ MongoDB connection error:', err);
    console.log('⚠️  Using in-memory storage as fallback');
});


const Hospital = require('./models/Hospital');
const Appointment = require('./models/Appointment');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


const telanganaHospitals = [
    {
        name: "Aware Gleneagles Global Hospital",
        city: "Hyderabad",
        address: "8-16-1, Nagarjuna Sagar Rd, Laxmi Enclave, Bairamalguda, L.B. Nagar",
        phone: "+91 40 2411 1111",
        email: "info.lb@globalhospitalsindia.com",
        location: { type: "Point", coordinates: [78.5447, 17.3409] },
        doctors: [
            { id: 1, name: "Dr. Praveen Kumar", specialization: "Cardiology", experience: "20 years", available: true },
            { id: 2, name: "Dr. Sunita Reddy", specialization: "Neurology", experience: "18 years", available: true }
        ],
        facilities: ["24/7 Emergency", "ICU", "Cardiac Care", "Neurology"],
        rating: 4.7,
        emergency: true,
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
            { id: 3, name: "Dr. Rajesh Varma", specialization: "Orthopedics", experience: "22 years", available: true },
            { id: 4, name: "Dr. Anjali Rao", specialization: "Pediatrics", experience: "15 years", available: true }
        ],
        facilities: ["Emergency Services", "Orthopedics", "Pediatrics", "Pharmacy"],
        rating: 4.5,
        emergency: true,
        type: "Private",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"
    }
];


async function initializeDatabase() {
    try {
        
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


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'apnadr.demo@gmail.com',
        pass: 'YOUR_APP_PASSWORD'
    }
});


app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'ApnaDr API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});


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
                    $maxDistance: radius * 1000
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

app.post('/api/appointments', async (req, res) => {
    try {
        const {
            patientName, patientPhone, patientGender, patientEmail, hospitalId,
            doctorId, appointmentDate, appointmentTime, symptoms
        } = req.body;

        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(appointmentDate);

        if (selectedDate < today) {
            return res.status(400).json({ success: false, message: "Appointment date cannot be in the past." });
        }

        
        const existingAppointment = await Appointment.findOne({
            hospitalId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status: 'Confirmed'
        });

        if (existingAppointment) {
            return res.status(409).json({ success: false, message: "This appointment slot is already taken. Please choose another time." });
        }

        
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found." });
        }

        const doctor = hospital.doctors.find(doc => doc.id === parseInt(doctorId));
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found in this hospital." });
        }

        
        const newAppointment = new Appointment({
            appointmentId: uuidv4(),
            patientName,
            patientPhone,
            patientGender,
            patientEmail,
            hospitalId,
            doctorId,
            hospitalName: hospital.name,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            appointmentDate,
            appointmentTime,
            symptoms
        });

        const savedAppointment = await newAppointment.save();

        
        if (patientEmail) {
            const mailOptions = {
                from: '"ApnaDr" <apnadr.demo@gmail.com>',
                to: patientEmail,
                subject: 'Appointment Confirmation - ApnaDr',
                html: `
                    <h2>Your Appointment is Confirmed!</h2>
                    <p>Hello ${savedAppointment.patientName},</p>
                    <p>Here are your appointment details:</p>
                    <ul>
                        <li><strong>Appointment ID:</strong> ${savedAppointment.appointmentId}</li>
                        <li><strong>Hospital:</strong> ${savedAppointment.hospitalName}</li>
                        <li><strong>Doctor:</strong> ${savedAppointment.doctorName} (${savedAppointment.doctorSpecialization})</li>
                        <li><strong>Date:</strong> ${savedAppointment.appointmentDate}</li>
                        <li><strong>Time:</strong> ${savedAppointment.appointmentTime}</li>
                    </ul>
                    <p>Thank you for using ApnaDr.</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                    
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }

        res.status(201).json({ success: true, message: "Appointment booked successfully!", data: savedAppointment });

    } catch (error) {
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(' ') });
        }
        console.error('Appointment booking error:', error);
        res.status(500).json({ success: false, message: 'Server error while booking appointment.' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 ApnaDr Backend Server running on port ${PORT}`);
    
    initializeDatabase();
});

module.exports = app;
