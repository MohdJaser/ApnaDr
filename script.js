// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global variables
let currentLocation = null;
let selectedHospital = null;
let hospitals = [];
let doctors = [];

// API Functions
async function fetchHospitals(city = '', area = '') {
    try {
        let url = `${API_BASE_URL}/hospitals`;
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (area) params.append('area', area);
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch hospitals:', result.message);
            return getDemoHospitals();
        }
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        return getDemoHospitals();
    }
}

async function fetchNearbyHospitals(lat, lng, radius = 10) {
    try {
        const url = `${API_BASE_URL}/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch nearby hospitals:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching nearby hospitals:', error);
        return [];
    }
}

async function fetchDoctorsByHospital(hospitalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/doctors`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch doctors:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
}

async function bookAppointmentAPI(appointmentData) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error booking appointment:', error);
        return { success: false, message: 'Network error' };
    }
}

// Demo data fallback
function getDemoHospitals() {
    return [
        {
            _id: 1,
            name: "Osmania General Hospital",
            city: "Hyderabad",
            address: "Afzalgunj, Hyderabad, Telangana 500012",
            phone: "+91 40 2345 6789",
            doctors: [
                { name: "Dr. Rajesh Kumar", specialization: "General Medicine", experience: "15 years", available: true },
                { name: "Dr. Priya Sharma", specialization: "Gynecology", experience: "12 years", available: true }
            ],
            facilities: ["ICU", "Emergency", "Surgery"],
            rating: 4.2,
            emergency: true,
            type: "Government"
        }
    ];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 ApnaDr Frontend Initialized');
    
    // Load hospitals on page load
    await loadHospitals();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize location services
    initializeLocationServices();
});

// Load hospitals
async function loadHospitals() {
    try {
        showLoading('hospitalList', 'Loading hospitals...');
        hospitals = await fetchHospitals();
        displayHospitals(hospitals);
        hideLoading('hospitalList');
    } catch (error) {
        console.error('Error loading hospitals:', error);
        hideLoading('hospitalList');
        showError('hospitalList', 'Failed to load hospitals');
    }
}

// Get user's current location and find nearby hospitals
async function getUserLocation() {
    if (navigator.geolocation) {
        showLoading('hospitalList', 'Getting your location...');
        
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const { latitude, longitude } = position.coords;
                currentLocation = { lat: latitude, lng: longitude };
                
                console.log('📍 User location:', currentLocation);
                
                // Find nearby hospitals
                const nearbyHospitals = await fetchNearbyHospitals(latitude, longitude, 10);
                
                if (nearbyHospitals.length > 0) {
                    displayHospitals(nearbyHospitals);
                    showSuccess('hospitalList', `Found ${nearbyHospitals.length} hospitals near your location`);
                } else {
                    // Fallback to all hospitals if no nearby ones found
                    await loadHospitals();
                    showInfo('hospitalList', 'No hospitals found nearby. Showing all hospitals.');
                }
                
                hideLoading('hospitalList');
            },
            function(error) {
                console.log('❌ Location access denied:', error.message);
                hideLoading('hospitalList');
                showInfo('hospitalList', 'Location access denied. Showing all hospitals.');
                loadHospitals();
            }
        );
    } else {
        console.log('❌ Geolocation not supported');
        hideLoading('hospitalList');
        showInfo('hospitalList', 'Location services not available. Showing all hospitals.');
        loadHospitals();
    }
}

// Initialize location services
function initializeLocationServices() {
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', getUserLocation);
    }
}

// Find nearby hospitals based on user input
async function findNearbyHospitals() {
    const searchInput = document.getElementById('hospitalSearch');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        await loadHospitals();
        return;
    }
    
    try {
        showLoading('hospitalList', 'Searching hospitals...');
        
        // Try to find hospitals by city/area
        const searchResults = await fetchHospitals(searchTerm, searchTerm);
        
        if (searchResults.length > 0) {
            displayHospitals(searchResults);
            showSuccess('hospitalList', `Found ${searchResults.length} hospitals for "${searchTerm}"`);
        } else {
            showInfo('hospitalList', `No hospitals found for "${searchTerm}". Showing all hospitals.`);
            await loadHospitals();
        }
        
        hideLoading('hospitalList');
    } catch (error) {
        console.error('Error searching hospitals:', error);
        hideLoading('hospitalList');
        showError('hospitalList', 'Search failed');
    }
}

// Display hospitals
function displayHospitals(hospitalsToShow) {
    const hospitalList = document.getElementById('hospitalList');
    if (!hospitalList) return;
    
    if (hospitalsToShow.length === 0) {
        hospitalList.innerHTML = '<div class="no-results">No hospitals found</div>';
        return;
    }
    
    hospitalList.innerHTML = hospitalsToShow.map(hospital => `
        <div class="hospital-card" data-hospital-id="${hospital._id}">
            <div class="hospital-image">
                <img src="${hospital.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400'}" alt="${hospital.name}">
                ${hospital.emergency ? '<span class="emergency-badge">Emergency</span>' : ''}
            </div>
            <div class="hospital-info">
                <h3>${hospital.name}</h3>
                <p class="hospital-address">📍 ${hospital.address}</p>
                <p class="hospital-phone">📞 ${hospital.phone}</p>
                <div class="hospital-rating">
                    <span class="stars">${'★'.repeat(Math.floor(hospital.rating))}${'☆'.repeat(5-Math.floor(hospital.rating))}</span>
                    <span class="rating-text">${hospital.rating}/5</span>
                </div>
                <div class="hospital-facilities">
                    ${hospital.facilities ? hospital.facilities.slice(0, 3).map(facility => 
                        `<span class="facility-tag">${facility}</span>`
                    ).join('') : ''}
                </div>
            </div>
            <div class="hospital-actions">
                <button class="btn btn-primary" onclick="selectHospital('${hospital._id}')">
                    Book Appointment
                </button>
                <button class="btn btn-secondary" onclick="viewDoctors('${hospital._id}')">
                    View Doctors
                </button>
            </div>
        </div>
    `).join('');
}

// Select hospital for appointment
async function selectHospital(hospitalId) {
    try {
        selectedHospital = hospitals.find(h => h._id === hospitalId);
        if (!selectedHospital) {
            showError('appointmentForm', 'Hospital not found');
            return;
        }
        
        // Load doctors for this hospital
        doctors = await fetchDoctorsByHospital(hospitalId);
        
        // Update appointment form
        document.getElementById('selectedHospital').textContent = selectedHospital.name;
        document.getElementById('appointmentForm').style.display = 'block';
        
        // Populate doctor dropdown
        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Select a doctor</option>' +
            doctors.map(doctor => `
                <option value="${doctors.indexOf(doctor)}">${doctor.name} - ${doctor.specialization} (${doctor.experience})</option>
            `).join('');
        
        showSuccess('appointmentForm', `Selected: ${selectedHospital.name}`);
        
    } catch (error) {
        console.error('Error selecting hospital:', error);
        showError('appointmentForm', 'Failed to load hospital details');
    }
}

// View doctors for a hospital
async function viewDoctors(hospitalId) {
    try {
        const hospital = hospitals.find(h => h._id === hospitalId);
        if (!hospital) {
            showError('doctorList', 'Hospital not found');
            return;
        }
        
        const doctors = await fetchDoctorsByHospital(hospitalId);
        
        const doctorList = document.getElementById('doctorList');
        if (doctorList) {
            doctorList.innerHTML = `
                <h3>Doctors at ${hospital.name}</h3>
                <div class="doctor-grid">
                    ${doctors.map(doctor => `
                        <div class="doctor-card">
                            <div class="doctor-info">
                                <h4>${doctor.name}</h4>
                                <p class="specialization">${doctor.specialization}</p>
                                <p class="experience">Experience: ${doctor.experience}</p>
                                <span class="availability ${doctor.available ? 'available' : 'unavailable'}">
                                    ${doctor.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            document.getElementById('doctorModal').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error viewing doctors:', error);
        showError('doctorList', 'Failed to load doctors');
    }
}

// Handle appointment submission
async function handleAppointmentSubmission(event) {
    event.preventDefault();
    
    if (!selectedHospital) {
        showError('appointmentForm', 'Please select a hospital first');
        return;
    }
    
    const formData = new FormData(event.target);
    const appointmentData = {
        patientName: formData.get('patientName'),
        patientPhone: formData.get('patientPhone'),
        patientEmail: formData.get('patientEmail') || '',
        hospitalId: selectedHospital._id,
        doctorId: parseInt(formData.get('doctorSelect')),
        appointmentDate: formData.get('appointmentDate'),
        appointmentTime: formData.get('appointmentTime'),
        symptoms: formData.get('symptoms') || '',
        emergency: formData.get('emergency') === 'on'
    };
    
    // Validation
    if (!appointmentData.patientName || !appointmentData.patientPhone || 
        !appointmentData.doctorId || !appointmentData.appointmentDate || !appointmentData.appointmentTime) {
        showError('appointmentForm', 'Please fill in all required fields');
        return;
    }
    
    try {
        showLoading('appointmentForm', 'Booking appointment...');
        
        const result = await bookAppointmentAPI(appointmentData);
        
        if (result.success) {
            showAppointmentConfirmation(result.data);
            event.target.reset();
            document.getElementById('appointmentForm').style.display = 'none';
        } else {
            showError('appointmentForm', result.message || 'Failed to book appointment');
        }
        
        hideLoading('appointmentForm');
        
    } catch (error) {
        console.error('Error booking appointment:', error);
        hideLoading('appointmentForm');
        showError('appointmentForm', 'Network error. Please try again.');
    }
}

// Show appointment confirmation
function showAppointmentConfirmation(appointment) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationContent = document.getElementById('confirmationContent');
    
    confirmationContent.innerHTML = `
        <div class="confirmation-details">
            <h3>✅ Appointment Confirmed!</h3>
            <div class="confirmation-info">
                <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                <p><strong>Patient:</strong> ${appointment.patientName}</p>
                <p><strong>Hospital:</strong> ${appointment.hospitalName}</p>
                <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
                <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
                <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
            </div>
            <div class="confirmation-note">
                <p>📧 A confirmation email has been sent to your email address.</p>
                <p>📱 Please arrive 15 minutes before your scheduled time.</p>
            </div>
        </div>
    `;
    
    confirmationModal.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Hospital search
    const searchInput = document.getElementById('hospitalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(findNearbyHospitals, 500));
    }
    
    // Appointment form
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmission);
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${message}</div>`;
    }
}

function hideLoading(elementId) {
    // Loading will be hidden when content is loaded
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        element.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

function showInfo(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.textContent = message;
        element.appendChild(infoDiv);
        setTimeout(() => infoDiv.remove(), 4000);
    }
} 