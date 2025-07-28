# ApnaDr - Your Nearby Medical Access in Emergencies

## 🏥 Problem Statement

**"In emergency situations, people often struggle to locate nearby hospitals, available doctors, and fast transport — especially if ambulances are delayed due to traffic. There is a lack of a unified platform that provides real-time hospital info, doctor appointments, and alternative transport options during medical emergencies."**

### The Challenge
- **Time-critical situations**: Every minute counts in medical emergencies
- **Traffic congestion**: Ambulances often get stuck in traffic, delaying critical care
- **Information fragmentation**: No single platform for hospital info, appointments, and transport
- **Accessibility issues**: Difficulty finding nearby medical facilities quickly
- **Transport alternatives**: Limited options when ambulances are unavailable

## 🎯 Solution Overview

ApnaDr is a comprehensive web platform that addresses these critical healthcare access challenges by providing:

### Core Features
1. **🏥 Hospital Discovery**: Find nearby hospitals within 5-8 km radius
2. **👨‍⚕️ Doctor Information**: Browse available doctors and their specializations
3. **📅 Appointment Booking**: Easy online appointment scheduling
4. **🚨 Emergency Assistance**: Quick access to nearest emergency hospitals
5. **🚗 Transport Integration**: Alternative transport options (Ola, Uber, Rapido) when ambulances are stuck

## ✨ Key Features

### 1. Hospital Search & Discovery
- **Location-based search**: Find hospitals near your current location
- **Detailed information**: Hospital ratings, facilities, contact details
- **Distance calculation**: Shows exact distance from your location
- **Doctor listings**: Available doctors with specializations and experience

### 2. Appointment Booking System
- **Easy booking**: Simple form-based appointment scheduling
- **Hospital selection**: Choose from nearby hospitals
- **Doctor selection**: Pick from available doctors
- **Date & time**: Flexible scheduling options
- **Confirmation**: Instant appointment confirmation with ID

### 3. Emergency Assistance
- **Quick access**: One-click emergency help
- **Nearest hospitals**: Shows top 5 emergency hospitals
- **Direct calling**: One-tap hospital calling
- **Directions**: Get directions to hospitals
- **Emergency numbers**: Quick access to 108, 100, 101

### 4. Transport Integration
- **Multiple options**: Ola, Uber, Rapido integration
- **Ambulance calling**: Direct ambulance service
- **Traffic alternatives**: When ambulances are stuck in traffic
- **Quick booking**: Direct links to transport apps

### 5. User Experience
- **Responsive design**: Works on all devices
- **Modern UI**: Beautiful, intuitive interface
- **Fast loading**: Optimized for quick access
- **Mobile-friendly**: Perfect for emergency situations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Modern CSS with Flexbox and Grid
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins)
- **Responsive**: Mobile-first design approach
- **No Backend**: Static data for demo purposes

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required

### Installation
1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Start using** ApnaDr immediately!

### File Structure
```
APNADR/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 📱 How to Use

### 1. Find Hospitals
- Enter your location or use current location
- Browse nearby hospitals with ratings and details
- View available doctors and facilities

### 2. Book Appointment
- Select a hospital from the dropdown
- Choose a doctor and specialization
- Pick date and time
- Fill in your details
- Get instant confirmation

### 3. Emergency Help
- Click "Get Emergency Help" button
- View nearest emergency hospitals
- Call hospitals directly
- Get directions instantly

### 4. Transport Services
- Choose from Ola, Uber, or Rapido
- Direct links to transport apps
- Call ambulance service (108)

## 🎨 Design Features

### Modern UI/UX
- **Gradient backgrounds**: Beautiful color schemes
- **Card-based layout**: Clean, organized information
- **Smooth animations**: Enhanced user experience
- **Interactive elements**: Hover effects and transitions
- **Emergency styling**: Pulsing animations for urgent features

### Responsive Design
- **Mobile-first**: Optimized for smartphones
- **Tablet-friendly**: Works on all screen sizes
- **Desktop optimized**: Full-featured on larger screens
- **Touch-friendly**: Easy navigation on mobile devices

## 🔧 Customization

### Adding Hospitals
Edit the `hospitalsData` array in `script.js`:
```javascript
{
    id: 6,
    name: "Your Hospital",
    distance: "3.2 km",
    address: "Your Address",
    phone: "+91 98765 43215",
    email: "info@yourhospital.com",
    doctors: [
        { id: 16, name: "Dr. Your Doctor", specialization: "Specialty", experience: "X years" }
    ],
    facilities: ["ICU", "Emergency"],
    rating: 4.5,
    emergency: true
}
```

### Modifying Transport Services
Update the `transportServices` object in `script.js`:
```javascript
yourService: {
    name: "Your Service",
    url: "https://yourservice.com",
    phone: "+91 1800 000 0000",
    icon: "fas fa-your-icon"
}
```

## 🏆 Hackathon Ready Features

### Demo-Ready
- **Complete functionality**: All features working
- **Realistic data**: 5 hospitals with 15 doctors
- **Professional design**: Ready for presentation
- **No backend needed**: Pure frontend solution

### Presentation Points
1. **Problem identification**: Clear emergency healthcare challenges
2. **Solution demonstration**: Live appointment booking
3. **Emergency features**: Show emergency assistance
4. **Transport integration**: Demonstrate alternative options
5. **User experience**: Smooth, intuitive interface

## 📞 Emergency Numbers

- **Ambulance**: 108
- **Police**: 100
- **Fire**: 101
- **Women Helpline**: 1091
- **Child Helpline**: 1098

## 🤝 Contributing

This is a hackathon project. Feel free to:
- Add more hospitals and doctors
- Enhance the UI/UX
- Add more transport options
- Implement backend integration
- Add real-time features

## 📄 License

This project is created for educational and hackathon purposes.

## 👨‍💻 Developer

Created for hackathon competition with focus on:
- **Social impact**: Addressing real healthcare challenges
- **Innovation**: Unique transport integration approach
- **User-centric**: Designed for emergency situations
- **Scalability**: Easy to extend and enhance

---

**ApnaDr** - Making healthcare accessible when it matters most! 🏥🚨 