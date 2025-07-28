// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global variables
let currentLocation = null;
let selectedHospital = null;
let hospitals = [];
let doctors = [];
let map;
let markers = [];
let infoWindow;

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
            _id: "demo1",
            name: "Demo General Hospital",
            city: "Hyderabad",
            address: "Afzalgunj, Hyderabad, Telangana 500012",
            phone: "+91 40 2345 6789",
            doctors: [
                { id: 1, name: "Dr. Demo Kumar", specialization: "General Medicine", experience: "15 years", available: true },
            ],
            facilities: ["ICU", "Emergency", "Surgery"],
            rating: 4.2,
            emergency: true,
            type: "Government",
            location: { coordinates: [78.4867, 17.3850] }
        }
    ];
}

// Populate hospital dropdown in appointment form
function populateHospitalDropdown() {
    const hospitalSelect = document.getElementById('hospitalSelect');
    if (!hospitalSelect) return;
    hospitalSelect.innerHTML = '<option value="">Choose a hospital</option>' +
        hospitals.map(hospital => `<option value="${hospital._id}">${hospital.name}</option>`).join('');
}

// When hospital is selected, update doctor dropdown
function setupHospitalDoctorDropdowns() {
    const hospitalSelect = document.getElementById('hospitalSelect');
    const doctorSelect = document.getElementById('doctorSelect');
    if (!hospitalSelect || !doctorSelect) return;
    hospitalSelect.addEventListener('change', async function() {
        const hospitalId = hospitalSelect.value;
        if (!hospitalId) {
            doctorSelect.innerHTML = '<option value="">Choose a doctor</option>';
            return;
        }
        selectedHospital = hospitals.find(h => h._id == hospitalId);
        doctors = await fetchDoctorsByHospital(hospitalId);
        doctorSelect.innerHTML = '<option value="">Choose a doctor</option>' +
            doctors.map(doctor => `<option value="${doctor.id || doctor._id || doctor.name}">${doctor.name} - ${doctor.specialization} (${doctor.experience})</option>`).join('');
    });
}

// Modals
function showAppointmentConfirmation(appointment) {
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentDetails = document.getElementById('appointmentDetails');
    appointmentDetails.innerHTML = `
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
    appointmentModal.style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Emergency and transport
async function handleEmergency() {
    if (navigator.geolocation) {
        showLoading('emergencyHospitals', 'Getting your location and finding the nearest hospital...');
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const { latitude, longitude } = position.coords;
                currentLocation = { lat: latitude, lng: longitude };

                try {
                    const response = await fetch(`${API_BASE_URL}/hospitals/emergency/nearest?lat=${latitude}&lng=${longitude}`);
                    const result = await response.json();
                    hideLoading('emergencyHospitals');

                    if (result.success && result.data) {
                        const hospital = result.data;
                        const emergencyModal = document.getElementById('emergencyModal');
                        const emergencyDetails = document.getElementById('emergencyDetails');

                        // 1. Show the nearest hospital
                        emergencyDetails.innerHTML = `
                            <h3>Nearest Emergency Hospital</h3>
                            <h4>${hospital.name}</h4>
                            <p>${hospital.address}</p>
                            <p><strong>Phone:</strong> ${hospital.phone}</p>
                            <div id="ambulanceStatus" class="info-message" style="display: none;"></div>
                        `;
                        emergencyModal.style.display = 'block';

                        const callButton = emergencyModal.querySelector('.btn-emergency');
                        callButton.onclick = () => window.location.href = `tel:${hospital.phone}`;
                        const directionsButton = emergencyModal.querySelector('.btn-secondary');
                        // Corrected Google Maps URL
                        directionsButton.onclick = () => window.open(`https://maps.google.com/?q=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`, '_blank');


                        // 2. Simulate ambulance call and show ETA
                        const ambulanceStatus = document.getElementById('ambulanceStatus');
                        ambulanceStatus.style.display = 'block';
                        let eta = 120; // 2 minutes for demo
                        ambulanceStatus.innerHTML = `Ambulance dispatched! Arriving in <span id="etaTime">${eta}</span> seconds.`;
                        const etaTimeElement = document.getElementById('etaTime');

                        const etaInterval = setInterval(() => {
                            eta--;
                            etaTimeElement.textContent = eta;
                            if (eta <= 0) {
                                clearInterval(etaInterval);
                                ambulanceStatus.innerHTML = "Ambulance has arrived!";
                            }
                        }, 1000);

                        // 3. Set a timeout for cab booking if ambulance is late
                        setTimeout(() => {
                            if (eta > 0) { // If ambulance hasn't arrived
                                clearInterval(etaInterval);
                                ambulanceStatus.innerHTML = "Ambulance is delayed. Booking a cab for you...";
                                bookCab(hospital);
                            }
                        }, 125000); // 2 minutes 5 seconds for demo

                    } else {
                        showError('emergencyHospitals', 'Could not find a nearby emergency hospital.');
                    }
                } catch (error) {
                    hideLoading('emergencyHospitals');
                    showError('emergencyHospitals', 'Could not find a nearby emergency hospital.');
                    console.error('Error fetching nearest hospital:', error);
                }
            },
            function(error) {
                hideLoading('emergencyHospitals');
                showError('emergencyHospitals', 'Could not get your location. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        showError('emergencyHospitals', 'Geolocation is not supported by your browser.');
    }
}

// NEW: Function to book a cab
function bookCab(hospital) {
    const services = [
        { name: 'Ola', url: 'https://book.olacabs.com/' },
        { name: 'Uber', url: 'https://m.uber.com/looking' },
        { name: 'Rapido', url: 'https://www.rapido.bike/' }
    ];
    const selectedService = services[Math.floor(Math.random() * services.length)];

    const ambulanceStatus = document.getElementById('ambulanceStatus');
    ambulanceStatus.innerHTML += `<br>Booking a ${selectedService.name}...`;

    setTimeout(() => {
        window.open(selectedService.url, '_blank');
        alert(`Redirecting to ${selectedService.name} to book a ride to ${hospital.name}.`);
    }, 2000);
}


function openTransport(service) {
    let url = '';
    if (service === 'ola') {
        url = 'https://book.olacabs.com/';
    } else if (service === 'uber') {
        url = 'https://m.uber.com/looking';
    } else if (service === 'rapido') {
        url = 'https://www.rapido.bike/';
    }
    if (url) {
        window.open(url, '_blank');
    }
}

function callAmbulance() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.location.href = 'tel:108';
    } else {
        alert('Call Ambulance: 108');
    }
}

// Smooth scroll
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 ApnaDr Frontend Initialized');
    
    // Load hospitals on page load
    await loadHospitals();
    populateHospitalDropdown();
    setupHospitalDoctorDropdowns();
    
    // Set up event listeners
    setupEventListeners();
});

// Load and display hospitals
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

async function getUserLocation() {
    if (navigator.geolocation) {
        showLoading('hospitalList', 'Getting your location...');
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const { latitude, longitude } = position.coords;
                currentLocation = { lat: latitude, lng: longitude };
                map.setCenter(currentLocation);
                new google.maps.Marker({
                  position: currentLocation,
                  map: map,
                  title: "You are here!",
                  icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });
                const nearbyHospitals = await fetchNearbyHospitals(latitude, longitude, 10);
                if (nearbyHospitals.length > 0) {
                    displayHospitals(nearbyHospitals);
                    showSuccess('hospitalList', `Found ${nearbyHospitals.length} hospitals near you`);
                } else {
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

async function findNearbyHospitals() {
    const searchInput = document.getElementById('hospitalSearch');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        await loadHospitals();
        return;
    }
    
    try {
        showLoading('hospitalList', 'Searching hospitals...');
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

function displayHospitals(hospitalsToShow) {
    const hospitalList = document.getElementById('hospitalList');
    if (!hospitalList) return;
    
    if (hospitalsToShow.length === 0) {
        hospitalList.innerHTML = '<div class="no-results">No hospitals found</div>';
        if (window.google && window.google.maps) {
            updateMapMarkers([]);
        }
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
                    <span class="stars">${'★'.repeat(Math.floor(hospital.rating || 0))}${'☆'.repeat(5-Math.floor(hospital.rating || 0))}</span>
                    <span class="rating-text">${hospital.rating || 'N/A'}/5</span>
                </div>
                <div class="hospital-facilities">
                    ${hospital.facilities ? hospital.facilities.slice(0, 3).map(facility => 
                        `<span class="facility-tag">${facility}</span>`
                    ).join('') : ''}
                </div>
            </div>
            <div class="hospital-actions">
                <button class="btn btn-primary" onclick="selectAndScrollToAppointment('${hospital._id}')">
                    Book Appointment
                </button>
                <button class="btn btn-secondary" onclick="viewDoctors('${hospital._id}')">
                    View Doctors
                </button>
            </div>
        </div>
    `).join('');
    
    if (window.google && window.google.maps) {
        updateMapMarkers(hospitalsToShow);
    }
}

async function selectAndScrollToAppointment(hospitalId) {
    await selectHospital(hospitalId);
    scrollToSection('appointment');
}

async function selectHospital(hospitalId) {
    try {
        const hospitalSelect = document.getElementById('hospitalSelect');
        hospitalSelect.value = hospitalId;
        
        selectedHospital = hospitals.find(h => h._id == hospitalId);
        if (!selectedHospital) {
            showError('appointmentForm', 'Hospital not found');
            return;
        }
        
        doctors = await fetchDoctorsByHospital(hospitalId);
        
        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Choose a doctor</option>' +
            doctors.map(doctor => `
                <option value="${doctor.id || doctor._id || doctor.name}">${doctor.name} - ${doctor.specialization} (${doctor.experience})</option>
            `).join('');
            
        showSuccess('appointmentForm', `Selected: ${selectedHospital.name}`);
        
    } catch (error) {
        console.error('Error selecting hospital:', error);
        showError('appointmentForm', 'Failed to load hospital details');
    }
}

async function viewDoctors(hospitalId) {
    try {
        const hospital = hospitals.find(h => h._id == hospitalId);
        if (!hospital) {
            alert('Hospital not found');
            return;
        }

        const doctors = await fetchDoctorsByHospital(hospitalId);
        let doctorsHtml = `<h3>Doctors at ${hospital.name}</h3>`;
        if (doctors.length > 0) {
            doctorsHtml += '<ul>';
            doctors.forEach(doctor => {
                doctorsHtml += `<li>${doctor.name} - ${doctor.specialization}</li>`;
            });
            doctorsHtml += '</ul>';
        } else {
            doctorsHtml += '<p>No doctors listed for this hospital.</p>';
        }
        
        alert(doctorsHtml); // This can be improved with a modal

    } catch (error) {
        console.error('Error viewing doctors:', error);
        alert('Failed to load doctors');
    }
}

async function handleAppointmentSubmission(event) {
    event.preventDefault();
    
    const hospitalSelect = document.getElementById('hospitalSelect');
    if (!hospitalSelect.value) {
        alert('Please select a hospital first');
        return;
    }
    
    const appointmentData = {
        patientName: document.getElementById('patientName').value,
        patientPhone: document.getElementById('patientPhone').value,
        patientEmail: document.getElementById('patientEmail').value || '',
        hospitalId: hospitalSelect.value,
        doctorId: parseInt(document.getElementById('doctorSelect').value),
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        symptoms: document.getElementById('symptoms').value || '',
    };
    
    if (!appointmentData.patientName || !appointmentData.patientPhone || 
        !appointmentData.doctorId || !appointmentData.appointmentDate || !appointmentData.appointmentTime) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        showLoading('appointmentForm', 'Booking appointment...');
        const result = await bookAppointmentAPI(appointmentData);
        hideLoading('appointmentForm');
        
        if (result.success) {
            showAppointmentConfirmation(result.data);
            document.getElementById('appointmentForm').reset();
        } else {
            alert(result.message || 'Failed to book appointment');
        }
        
    } catch (error) {
        hideLoading('appointmentForm');
        console.error('Error booking appointment:', error);
        alert('Network error. Please try again.');
    }
}

// Event Listeners
function setupEventListeners() {
    document.querySelector('.search-btn').addEventListener('click', findNearbyHospitals);
    document.getElementById('locationBtn').addEventListener('click', getUserLocation);
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmission);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href.substring(1));
            }
        });
    });
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
}

// Utility functions
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${message}</div>`;
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if(element) {
        const loadingDiv = element.querySelector('.loading');
        if(loadingDiv) loadingDiv.remove();
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if(element) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'success-message';
        msgDiv.textContent = message;
        element.prepend(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if(element) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'error-message';
        msgDiv.textContent = message;
        element.prepend(msgDiv);
        setTimeout(() => msgDiv.remove(), 5000);
    }
}

function showInfo(elementId, message) {
    const element = document.getElementById(elementId);
    if(element) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'info-message';
        msgDiv.textContent = message;
        element.prepend(msgDiv);
        setTimeout(() => msgDiv.remove(), 4000);
    }
}

// Google Maps functions
function initMap()
