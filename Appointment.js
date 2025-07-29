const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        required: true,
        unique: true
    },
    patientName: {
        type: String,
        required: [true, 'Patient name is required.'],
        trim: true
    },
    patientPhone: {
        type: String,
        required: [true, 'Patient phone number is required.'],
        validate: {
            validator: function(v) {
                
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    patientGender: {
        type: String,
        required: [true, 'Gender is required.'],
        enum: ['Male', 'Female', 'Other']
    },
    patientEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                
                if (!v) return true;
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital selection is required.']
    },
    doctorId: {
        type: Number,
        required: [true, 'Doctor selection is required.']
    },
    hospitalName: String,
    doctorName: String,
    doctorSpecialization: String,
    appointmentDate: {
        type: String,
        required: [true, 'Appointment date is required.']
    },
    appointmentTime: {
        type: String,
        required: [true, 'Appointment time is required.']
    },
    symptoms: String,
    status: {
        type: String,
        default: 'Confirmed'
    },
    cancelledAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
