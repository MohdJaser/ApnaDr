const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: String,
    specialization: String,
    experience: String,
    available: Boolean
});

const hospitalSchema = new mongoose.Schema({
    name: String,
    city: String,
    address: String,
    phone: String,
    email: String,
    location: {
        type: { type: String },
        coordinates: [Number]
    },
    doctors: [doctorSchema],
    facilities: [String],
    rating: Number,
    emergency: Boolean,
    type: String,
    image: String
});

module.exports = mongoose.model('Hospital', hospitalSchema); 