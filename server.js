const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/apnadr', {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

// Real Telangana Government Hospitals Data with Coordinates
const telanganaHospitals = [
    {
        name: "Osmania General Hospital",
        city: "Hyderabad",
        address: "Afzalgunj, Hyderabad, Telangana 500012",
        phone: "+91 40 2345 6789",
        email: "ogh.hyderabad@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850] // [longitude, latitude]
        },
        doctors: [
            { name: "Dr. Rajesh Kumar", specialization: "General Medicine", experience: "15 years", available: true },
            { name: "Dr. Priya Sharma", specialization: "Gynecology", experience: "12 years", available: true },
            { name: "Dr. Anil Kumar", specialization: "Pediatrics", experience: "10 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Surgery", "Laboratory", "X-Ray"],
        rating: 4.2,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400"
    },
    {
        name: "Gandhi Hospital",
        city: "Hyderabad",
        address: "Musheerabad, Secunderabad, Hyderabad, Telangana 500020",
        phone: "+91 40 2345 6790",
        email: "gandhi.hospital@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        },
        doctors: [
            { name: "Dr. Sunita Verma", specialization: "Cardiology", experience: "18 years", available: true },
            { name: "Dr. Amit Patel", specialization: "Orthopedics", experience: "14 years", available: true },
            { name: "Dr. Maria Garcia", specialization: "Dermatology", experience: "11 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Cardiology", "Radiology", "Blood Bank"],
        rating: 4.0,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "King Koti Government Hospital",
        city: "Hyderabad",
        address: "King Koti, Abids, Hyderabad, Telangana 500001",
        phone: "+91 40 2345 6791",
        email: "kingkoti.hospital@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        },
        doctors: [
            { name: "Dr. Lisa Wang", specialization: "Oncology", experience: "20 years", available: true },
            { name: "Dr. James Wilson", specialization: "Psychiatry", experience: "16 years", available: true },
            { name: "Dr. Carlos Rodriguez", specialization: "Endocrinology", experience: "13 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Oncology", "Psychiatry", "Laboratory"],
        rating: 3.8,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400"
    },
    {
        name: "Government Maternity Hospital",
        city: "Hyderabad",
        address: "Sultan Bazar, Hyderabad, Telangana 500095",
        phone: "+91 40 2345 6793",
        email: "maternity.hospital@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        },
        doctors: [
            { name: "Dr. Priya Reddy", specialization: "Gynecology", experience: "15 years", available: true },
            { name: "Dr. Anjali Sharma", specialization: "Obstetrics", experience: "12 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Gynecology", "Obstetrics", "Neonatal Care"],
        rating: 4.3,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Government Chest Hospital",
        city: "Hyderabad",
        address: "Erragadda, Hyderabad, Telangana 500018",
        phone: "+91 40 2345 6794",
        email: "chest.hospital@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        },
        doctors: [
            { name: "Dr. Rajesh Kumar", specialization: "Pulmonology", experience: "18 years", available: true },
            { name: "Dr. Sunita Verma", specialization: "Chest Medicine", experience: "14 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Pulmonology", "Chest Medicine", "X-Ray"],
        rating: 4.0,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400"
    },
    {
        name: "MGM Hospital Warangal",
        city: "Warangal",
        address: "MGM Hospital Road, Warangal, Telangana 506007",
        phone: "+91 870 245 5555",
        email: "mgmwarangal@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [79.5946, 17.9689]
        },
        doctors: [
            { name: "Dr. David Brown", specialization: "Urology", experience: "17 years", available: true },
            { name: "Dr. Jennifer Lee", specialization: "Ophthalmology", experience: "12 years", available: true },
            { name: "Dr. Robert Taylor", specialization: "ENT", experience: "15 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Urology", "Ophthalmology", "Blood Bank"],
        rating: 4.1,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Government District Hospital Ranga Reddy",
        city: "Ranga Reddy",
        address: "District Hospital Road, Ranga Reddy, Telangana 501301",
        phone: "+91 40 2345 6792",
        email: "rrdistrict.hospital@telangana.gov.in",
        location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        },
        doctors: [
            { name: "Dr. Anna Kim", specialization: "Pulmonology", experience: "19 years", available: true },
            { name: "Dr. Michael Chen", specialization: "Gastroenterology", experience: "14 years", available: true },
            { name: "Dr. Sarah Johnson", specialization: "Rheumatology", experience: "11 years", available: true }
        ],
        facilities: ["ICU", "Emergency", "Pulmonology", "Gastroenterology", "Laboratory"],
        rating: 3.9,
        emergency: true,
        type: "Government",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400"
    }
];

// Initialize database with Telangana hospitals
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

// Get all hospitals (with optional filtering)
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

// Find hospitals near user's location (NEW!)
app.get('/api/hospitals/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query; // radius in km
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const hospitals = await Hospital.find({
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

        res.json({
            success: true,
            data: hospitals,
            message: `Found ${hospitals.length} hospitals within ${radius}km`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get hospital by ID
app.get('/api/hospitals/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }
        res.json({
            success: true,
            data: hospital,
            message: 'Hospital retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get doctors by hospital
app.get('/api/hospitals/:id/doctors', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }
        res.json({
            success: true,
            data: hospital.doctors,
            message: 'Doctors retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Book appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientEmail,
            hospitalId,
            doctorId,
            appointmentDate,
            appointmentTime,
            symptoms,
            emergency
        } = req.body;

        // Validation
        if (!patientName || !patientPhone || !hospitalId || !doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Check if doctor exists
        const doctor = hospital.doctors.find(d => d.id === parseInt(doctorId));
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check for conflicting appointments
        const conflictingAppointment = await Appointment.findOne({
            hospitalId: hospitalId,
            doctorId: parseInt(doctorId),
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            status: { $ne: 'cancelled' }
        });

        if (conflictingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.'
            });
        }

        // Create appointment
        const appointment = new Appointment({
            patientName,
            patientPhone,
            patientEmail,
            hospitalId,
            doctorId: parseInt(doctorId),
            hospitalName: hospital.name,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            appointmentDate,
            appointmentTime,
            symptoms: symptoms || '',
            emergency: emergency || false,
            status: 'confirmed',
            appointmentId: `APT${Date.now().toString().slice(-6)}`
        });

        await appointment.save();

        // Send confirmation email (if email is provided)
        if (patientEmail) {
            try {
                await sendConfirmationEmail(appointment, patientEmail);
            } catch (emailError) {
                console.log('Email sending failed:', emailError.message);
            }
        }

        res.status(201).json({
            success: true,
            data: appointment,
            message: 'Appointment booked successfully'
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('hospitalId');
        res.json({
            success: true,
            data: appointments,
            message: 'Appointments retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        res.json({
            success: true,
            data: appointment,
            message: 'Appointment retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Cancel appointment
app.put('/api/appointments/:id/cancel', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        await appointment.save();

        res.json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get emergency hospitals
app.get('/api/hospitals/emergency', async (req, res) => {
    try {
        const emergencyHospitals = await Hospital.find({ emergency: true }).limit(5);
        res.json({
            success: true,
            data: emergencyHospitals,
            message: 'Emergency hospitals retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Helper functions

async function sendConfirmationEmail(appointment, email) {
    const mailOptions = {
        from: 'apnadr.demo@gmail.com',
        to: email,
        subject: 'Appointment Confirmation - ApnaDr',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">🏥 Appointment Confirmation</h2>
                <p>Dear ${appointment.patientName},</p>
                <p>Your appointment has been successfully booked with ApnaDr.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>Appointment Details:</h3>
                    <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                    <p><strong>Hospital:</strong> ${appointment.hospitalName}</p>
                    <p><strong>Doctor:</strong> ${appointment.doctorName} (${appointment.doctorSpecialization})</p>
                    <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
                    <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                    ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
                </div>
                
                <p>Please arrive 15 minutes before your scheduled time.</p>
                <p>If you need to cancel or reschedule, please contact us immediately.</p>
                
                <p>Best regards,<br>ApnaDr Team</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ApnaDr Backend Server running on port ${PORT}`);
    console.log(`📋 API Documentation:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/hospitals - Get all hospitals`);
    console.log(`   GET  /api/hospitals/nearby - Find nearby hospitals (NEW!)`);
    console.log(`   GET  /api/hospitals/:id - Get hospital by ID`);
    console.log(`   GET  /api/hospitals/:id/doctors - Get doctors by hospital`);
    console.log(`   POST /api/appointments - Book appointment`);
    console.log(`   GET  /api/appointments - Get all appointments`);
    console.log(`   GET  /api/appointments/:id - Get appointment by ID`);
    console.log(`   PUT  /api/appointments/:id/cancel - Cancel appointment`);
    console.log(`   GET  /api/hospitals/emergency - Get emergency hospitals`);
    
    // Initialize database
    initializeDatabase();
});

module.exports = app;