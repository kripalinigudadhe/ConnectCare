# Rural Health Connect

A comprehensive healthcare application designed for rural populations in India, featuring AI-powered symptom assessment, medical triage, and integration with the Ayushman Bharat Digital Health Mission.

## 🌟 Features

### Frontend Features
- **Multi-page HTML Application**: Clean, professional interface with separate pages for different functionalities
- **Responsive Design**: Mobile-first design optimized for various screen sizes
- **Symptom Checker**: Interactive questionnaire with dynamic follow-up questions
- **Patient Registration**: Comprehensive form collecting medical history and lifestyle information
- **Triage Results**: AI-powered recommendations based on symptom assessment
- **Healthcare Provider Directory**: List of available healthcare providers by location and specialization

### Backend Features
- **RESTful API**: Flask-based backend with comprehensive endpoints
- **AI-Powered Triage**: GPT-4 integration for intelligent symptom analysis
- **Database Management**: SQLAlchemy ORM with SQLite/PostgreSQL support
- **Medical Decision Trees**: Rule-based triage system for emergency, urgent, and routine care
- **Healthcare Provider Management**: Directory of local healthcare providers
- **Patient History Tracking**: Complete medical history and assessment tracking

## 🏗️ Architecture

### Frontend Structure
\`\`\`
public/
├── index.html              # Landing page
├── registration.html       # Patient registration
├── symptom-checker.html    # Interactive symptom assessment
├── triage-results.html     # Assessment results and recommendations
├── about.html             # About the platform
├── contact.html           # Contact information
├── styles.css             # Main stylesheet (no Tailwind)
├── script.js              # Main JavaScript functionality
├── symptom-checker.js     # Symptom checker logic
└── triage-results.js      # Results display logic
\`\`\`

### Backend Structure
\`\`\`
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── database_schema.sql   # Database schema
└── scripts/
    └── setup_database.py # Database initialization script
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js (for development server, optional)
- OpenAI API key (for AI recommendations)

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd rural-health-connect
   \`\`\`

2. **Set up Python environment**
   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env file with your configuration
   \`\`\`

4. **Initialize database**
   \`\`\`bash
   python scripts/setup_database.py
   \`\`\`

5. **Run the backend server**
   \`\`\`bash
   python app.py
   \`\`\`

### Frontend Setup

1. **Serve the frontend files**
   \`\`\`bash
   # Using Python's built-in server
   cd public
   python -m http.server 8000
   
   # Or using Node.js
   npx serve public
   \`\`\`

2. **Access the application**
   - Open your browser to `http://localhost:8000`
   - Backend API available at `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
# Flask Configuration
SECRET_KEY=your-super-secret-key-here
FLASK_ENV=development

# Database Configuration
DATABASE_URL=sqlite:///rural_health.db

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Ayushman Bharat Integration (placeholder)
AYUSHMAN_API_KEY=your-ayushman-api-key
AYUSHMAN_BASE_URL=https://api.ayushmanbharat.gov.in
\`\`\`

### Database Configuration

The application supports both SQLite (default) and PostgreSQL:

**SQLite (Development):**
\`\`\`env
DATABASE_URL=sqlite:///rural_health.db
\`\`\`

**PostgreSQL (Production):**
\`\`\`env
DATABASE_URL=postgresql://username:password@localhost/rural_health
\`\`\`

## 📊 API Endpoints

### Patient Management
- `POST /api/register` - Register new patient
- `GET /api/patient/<id>` - Get patient information
- `GET /api/assessments/<patient_id>` - Get patient's assessment history

### Symptom Assessment
- `POST /api/assess` - Create new symptom assessment
- `POST /api/emergency` - Handle emergency alerts

### Healthcare Providers
- `GET /api/providers` - List healthcare providers
- `GET /api/providers?location=<location>` - Filter by location
- `GET /api/providers?specialization=<spec>` - Filter by specialization

### System Information
- `GET /api/stats` - System statistics
- `GET /` - API health check

## 🎨 Design System

### Color Palette
- **Primary**: #1f2937 (Professional gray)
- **Secondary**: #10b981 (Healthcare green)
- **Accent**: #059669 (Darker green)
- **Background**: #ffffff (Clean white)
- **Card Background**: #f1f5f9 (Light gray)

### Typography
- **Font Family**: DM Sans
- **Headings**: DM Sans Bold (700)
- **Body Text**: DM Sans Regular (400)
- **UI Elements**: DM Sans Medium (500)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🏥 Medical Features

### Triage System
The application uses a sophisticated triage system that categorizes patients into three levels:

1. **Emergency** - Immediate medical attention required
2. **Urgent** - Medical attention needed within 24 hours
3. **Routine** - Can be managed with routine care

### AI Integration
- **GPT-4 Powered Recommendations**: Personalized healthcare guidance
- **Natural Language Processing**: Symptom extraction and analysis
- **Medical Decision Trees**: Rule-based triage logic
- **Cultural Adaptation**: Recommendations tailored for rural Indian healthcare

### Ayushman Bharat Integration
- **Digital Health Records**: Integration with India's national health mission
- **Healthcare Provider Network**: Access to government healthcare facilities
- **Insurance Integration**: Support for Ayushman Bharat insurance schemes

## 🔒 Security & Privacy

- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **HIPAA Compliance**: Healthcare data handling follows international standards
- **Privacy Protection**: Minimal data collection with explicit consent
- **Secure API**: Authentication and authorization for all endpoints

## 🌍 Localization

The application is designed for rural Indian populations:
- **Language Support**: English with plans for regional languages
- **Cultural Sensitivity**: Healthcare recommendations adapted for Indian context
- **Rural Accessibility**: Optimized for low-bandwidth connections
- **Simple Interface**: Designed for users with limited technical literacy

## 📱 Mobile Optimization

- **Progressive Web App**: Can be installed on mobile devices
- **Offline Capability**: Basic functionality available offline
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Optimized for slow internet connections

## 🧪 Testing

### Manual Testing
1. **Registration Flow**: Test patient registration with various data combinations
2. **Symptom Assessment**: Complete symptom checker with different symptom combinations
3. **Triage Logic**: Verify correct triage levels for different scenarios
4. **Responsive Design**: Test on various screen sizes and devices

### API Testing
\`\`\`bash
# Test patient registration
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Patient","age":30,"gender":"male"}'

# Test symptom assessment
curl -X POST http://localhost:5000/api/assess \
  -H "Content-Type: application/json" \
  -d '{"patient_id":1,"primary_symptom":"fever","symptom_onset":"today","symptom_severity":"moderate"}'
\`\`\`

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment** (using Gunicorn)
   \`\`\`bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   \`\`\`

2. **Frontend Deployment**
   - Deploy static files to any web server (Nginx, Apache, etc.)
   - Configure API endpoint URLs for production

3. **Database Migration**
   \`\`\`bash
   # For PostgreSQL production database
   python scripts/setup_database.py
   \`\`\`

### Docker Deployment

\`\`\`dockerfile
# Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ayushman Bharat Digital Health Mission** - For healthcare infrastructure support
- **OpenAI** - For AI-powered medical recommendations
- **Rural Healthcare Workers** - For insights into rural healthcare challenges
- **Medical Professionals** - For clinical guidance and validation

## 📞 Support

For support and questions:
- **Email**: support@ruralhealthconnect.in
- **Phone**: +91 1800-XXX-XXXX
- **Documentation**: [docs.ruralhealthconnect.in](https://docs.ruralhealthconnect.in)

---

**Rural Health Connect** - Bridging the gap between rural communities and quality healthcare through technology and compassion.
