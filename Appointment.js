const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: String,
    patientPhone: String,
    patientEmail: String,
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    doctorId: Number,
    hospitalName: String,
    doctorName: String,
    doctorSpecialization: String,
    appointmentDate: String,
    appointmentTime: String,
    symptoms: String,
    emergency: Boolean,
    status: String,
    appointmentId: String,
    cancelledAt: Date
});

module.exports = mongoose.model('Appointment', appointmentSchema); 