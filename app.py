from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///rural_health.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Set OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    preferred_language = db.Column(db.String(5), default='en')  # Language preference
    medical_conditions = db.Column(db.Text)  # JSON string
    medications = db.Column(db.Text)
    smoking = db.Column(db.String(10))
    alcohol = db.Column(db.String(10))
    exercise = db.Column(db.String(20))
    pregnancy = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    assessments = db.relationship('Assessment', backref='patient', lazy=True)
    consultations = db.relationship('Consultation', backref='patient', lazy=True)

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    primary_symptom = db.Column(db.String(50), nullable=False)
    symptom_onset = db.Column(db.String(20), nullable=False)
    symptom_severity = db.Column(db.String(20), nullable=False)
    additional_symptoms = db.Column(db.Text)  # JSON string
    pain_description = db.Column(db.Text)
    breathing_details = db.Column(db.Text)  # JSON string
    emergency_symptoms = db.Column(db.Text)  # JSON string
    triage_level = db.Column(db.String(20), nullable=False)
    ai_recommendations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    consultation_type = db.Column(db.String(20), default='basic')  # basic, premium, emergency
    cost = db.Column(db.Float, nullable=False)
    language = db.Column(db.String(5), default='en')
    audio_enabled = db.Column(db.Boolean, default=False)
    video_enabled = db.Column(db.Boolean, default=False)
    is_emergency = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationship
    messages = db.relationship('ChatMessage', backref='consultation', lazy=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultation.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)  # user, doctor, system
    content = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(5), default='en')
    audio_url = db.Column(db.String(255))  # For voice messages
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class HealthcareProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100))
    location = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    availability = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class VirtualDoctorAI:
    @staticmethod
    def get_language_responses():
        return {
            'en': {
                'greeting': "Hello! I'm your AI doctor assistant. How can I help you today?",
                'symptom_inquiry': "Can you describe your symptoms in detail?",
                'pain_scale': "On a scale of 1-10, how would you rate your pain?",
                'duration': "How long have you been experiencing these symptoms?",
                'emergency': "This sounds like it could be an emergency. Please seek immediate medical attention.",
                'followup': "I recommend following up with a healthcare provider within 24-48 hours."
            },
            'hi': {
                'greeting': "नमस्ते! मैं आपका AI डॉक्टर सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
                'symptom_inquiry': "कृपया अपने लक्षणों का विस्तार से वर्णन करें?",
                'pain_scale': "1-10 के पैमाने पर, आप अपने दर्द को कैसे रेट करेंगे?",
                'duration': "आप कितने समय से इन लक्षणों का अनुभव कर रहे हैं?",
                'emergency': "यह एक आपातकाल हो सकता है। कृपया तुरंत चिकित्सा सहायता लें।",
                'followup': "मैं सुझाता हूं कि 24-48 घंटों के भीतर किसी स्वास्थ्य सेवा प्रदाता से संपर्क करें।"
            }
        }
    
    @staticmethod
    def generate_contextual_response(message, patient_data, language='en'):
        """Generate AI response using GPT-4 with context"""
        try:
            language_responses = VirtualDoctorAI.get_language_responses()
            responses = language_responses.get(language, language_responses['en'])
            
            # Emergency keyword detection
            emergency_keywords = [
                'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
                'heart attack', 'stroke', 'seizure', 'can\'t breathe', 'choking'
            ]
            
            if any(keyword in message.lower() for keyword in emergency_keywords):
                return responses['emergency']
            
            # Context-aware responses
            if 'pain' in message.lower():
                return responses['pain_scale']
            elif any(word in message.lower() for word in ['fever', 'headache', 'cough', 'symptoms']):
                return responses['symptom_inquiry']
            elif any(word in message.lower() for word in ['how long', 'when', 'started']):
                return responses['duration']
            
            # Use GPT-4 for complex responses
            prompt = f"""
            You are an AI doctor assistant helping rural patients in India. 
            Respond in {language} language.
            
            Patient context:
            - Age: {patient_data.get('age', 'Unknown')}
            - Gender: {patient_data.get('gender', 'Unknown')}
            - Medical history: {patient_data.get('medical_conditions', 'None')}
            
            Patient message: {message}
            
            Provide a helpful, empathetic medical response. Keep it simple and practical for rural settings.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are a compassionate AI doctor assistant. Respond in {language} language with culturally appropriate medical guidance for rural India."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"AI response error: {e}")
            language_responses = VirtualDoctorAI.get_language_responses()
            return language_responses.get(language, language_responses['en'])['greeting']

# Triage Logic
class TriageSystem:
    @staticmethod
    def calculate_triage_level(symptom_data):
        """Calculate triage level based on symptoms"""
        
        # Emergency conditions
        emergency_symptoms = symptom_data.get('emergency_symptoms', [])
        if emergency_symptoms and 'none' not in emergency_symptoms:
            return 'emergency'
        
        # Very severe symptoms
        if symptom_data.get('symptom_severity') == 'very_severe':
            return 'emergency'
        
        # Urgent conditions
        primary_symptom = symptom_data.get('primary_symptom')
        severity = symptom_data.get('symptom_severity')
        onset = symptom_data.get('symptom_onset')
        
        urgent_conditions = [
            primary_symptom == 'chest_pain' and severity == 'severe',
            primary_symptom == 'breathing_difficulty',
            severity == 'severe' and primary_symptom in ['fever', 'abdominal_pain'],
            onset == 'today' and severity == 'severe'
        ]
        
        if any(urgent_conditions):
            return 'urgent'
        
        # Moderate severity conditions
        if (severity == 'severe' or 
            (severity == 'moderate' and primary_symptom in ['fever', 'chest_pain', 'abdominal_pain'])):
            return 'urgent'
        
        return 'routine'
    
    @staticmethod
    def generate_ai_recommendations(patient_data, symptom_data, triage_level):
        """Generate AI-powered recommendations using GPT-4"""
        try:
            prompt = f"""
            As a medical AI assistant, provide personalized healthcare recommendations for a patient with the following information:
            
            Patient Information:
            - Age: {patient_data.get('age')}
            - Gender: {patient_data.get('gender')}
            - Medical Conditions: {patient_data.get('conditions', [])}
            - Medications: {patient_data.get('medications', 'None')}
            - Lifestyle: Smoking: {patient_data.get('smoking', 'No')}, Alcohol: {patient_data.get('alcohol', 'No')}
            
            Symptoms:
            - Primary Symptom: {symptom_data.get('primary_symptom')}
            - Severity: {symptom_data.get('symptom_severity')}
            - Onset: {symptom_data.get('symptom_onset')}
            - Additional Symptoms: {symptom_data.get('additional_symptoms', [])}
            
            Triage Level: {triage_level}
            
            Please provide:
            1. Specific self-care recommendations
            2. Warning signs to watch for
            3. When to seek immediate medical attention
            4. Lifestyle modifications if applicable
            5. Follow-up recommendations
            
            Keep recommendations practical for rural healthcare settings in India.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medical AI assistant specializing in rural healthcare in India. Provide practical, culturally appropriate medical guidance."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"AI recommendation error: {e}")
            return "Please consult with a healthcare provider for personalized recommendations."

@app.route('/api/chat', methods=['POST'])
def chat_with_doctor():
    """Handle chat messages with virtual doctor"""
    try:
        data = request.get_json()
        message = data.get('message')
        language = data.get('language', 'en')
        patient_data = data.get('patientData', {})
        consultation_id = data.get('consultation_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Generate AI response
        response = VirtualDoctorAI.generate_contextual_response(
            message, patient_data, language
        )
        
        # Save messages to database if consultation_id provided
        if consultation_id:
            # Save user message
            user_message = ChatMessage(
                consultation_id=consultation_id,
                sender='user',
                content=message,
                language=language
            )
            db.session.add(user_message)
            
            # Save AI response
            ai_message = ChatMessage(
                consultation_id=consultation_id,
                sender='doctor',
                content=response,
                language=language
            )
            db.session.add(ai_message)
            db.session.commit()
        
        return jsonify({
            'response': response,
            'language': language,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/consultation', methods=['POST'])
def start_consultation():
    """Start a new consultation session"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        consultation_type = data.get('type', 'basic')
        language = data.get('language', 'en')
        audio_enabled = data.get('audio_enabled', False)
        video_enabled = data.get('video_enabled', False)
        is_emergency = data.get('is_emergency', False)
        
        # Calculate cost based on features
        cost = 50  # Basic
        if consultation_type == 'premium' or audio_enabled:
            cost = 80
        if is_emergency:
            cost = 200
        if video_enabled:
            cost += 50
        
        consultation = Consultation(
            patient_id=patient_id,
            consultation_type=consultation_type,
            cost=cost,
            language=language,
            audio_enabled=audio_enabled,
            video_enabled=video_enabled,
            is_emergency=is_emergency
        )
        
        db.session.add(consultation)
        db.session.commit()
        
        return jsonify({
            'consultation_id': consultation.id,
            'cost': cost,
            'type': consultation_type,
            'features': {
                'audio': audio_enabled,
                'video': video_enabled,
                'emergency': is_emergency
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/consultation/<int:consultation_id>/messages', methods=['GET'])
def get_consultation_messages(consultation_id):
    """Get all messages for a consultation"""
    try:
        messages = ChatMessage.query.filter_by(
            consultation_id=consultation_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        result = []
        for message in messages:
            result.append({
                'id': message.id,
                'sender': message.sender,
                'content': message.content,
                'language': message.language,
                'timestamp': message.timestamp.isoformat()
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes
@app.route('/')
def index():
    return jsonify({
        "message": "Rural Health Connect API",
        "version": "2.0.0",
        "status": "active",
        "features": [
            "Virtual Doctor AI",
            "Multilingual Support",
            "Voice Assistant",
            "Cost-based Pricing",
            "Emergency Detection"
        ]
    })

@app.route('/api/register', methods=['POST'])
def register_patient():
    """Register a new patient"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'age', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new patient
        patient = Patient(
            full_name=data['fullName'],
            age=int(data['age']),
            gender=data['gender'],
            phone=data.get('phone'),
            location=data.get('location'),
            preferred_language=data.get('language', 'en'),  # Added language preference
            medical_conditions=json.dumps(data.get('conditions', [])),
            medications=data.get('medications'),
            smoking=data.get('smoking'),
            alcohol=data.get('alcohol'),
            exercise=data.get('exercise'),
            pregnancy=data.get('pregnancy')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient registered successfully',
            'patient_id': patient.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/assess', methods=['POST'])
def create_assessment():
    """Create a new symptom assessment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'primary_symptom', 'symptom_onset', 'symptom_severity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get patient data for AI recommendations
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Calculate triage level
        symptom_data = {
            'primary_symptom': data['primary_symptom'],
            'symptom_onset': data['symptom_onset'],
            'symptom_severity': data['symptom_severity'],
            'additional_symptoms': data.get('additional_symptoms', []),
            'emergency_symptoms': data.get('emergency_symptoms', [])
        }
        
        triage_level = TriageSystem.calculate_triage_level(symptom_data)
        
        # Generate AI recommendations
        patient_data = {
            'age': patient.age,
            'gender': patient.gender,
            'conditions': json.loads(patient.medical_conditions or '[]'),
            'medications': patient.medications,
            'smoking': patient.smoking,
            'alcohol': patient.alcohol
        }
        
        ai_recommendations = TriageSystem.generate_ai_recommendations(
            patient_data, symptom_data, triage_level
        )
        
        # Create assessment record
        assessment = Assessment(
            patient_id=data['patient_id'],
            primary_symptom=data['primary_symptom'],
            symptom_onset=data['symptom_onset'],
            symptom_severity=data['symptom_severity'],
            additional_symptoms=json.dumps(data.get('additional_symptoms', [])),
            pain_description=data.get('pain_location'),
            breathing_details=json.dumps(data.get('breathing_details', [])),
            emergency_symptoms=json.dumps(data.get('emergency_symptoms', [])),
            triage_level=triage_level,
            ai_recommendations=ai_recommendations
        )
        
        db.session.add(assessment)
        db.session.commit()
        
        return jsonify({
            'assessment_id': assessment.id,
            'triage_level': triage_level,
            'recommendations': ai_recommendations,
            'created_at': assessment.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/patient/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get patient information"""
    try:
        patient = Patient.query.get_or_404(patient_id)
        
        return jsonify({
            'id': patient.id,
            'full_name': patient.full_name,
            'age': patient.age,
            'gender': patient.gender,
            'phone': patient.phone,
            'location': patient.location,
            'preferred_language': patient.preferred_language,  # Added language preference
            'medical_conditions': json.loads(patient.medical_conditions or '[]'),
            'medications': patient.medications,
            'smoking': patient.smoking,
            'alcohol': patient.alcohol,
            'exercise': patient.exercise,
            'pregnancy': patient.pregnancy,
            'created_at': patient.created_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/<int:patient_id>', methods=['GET'])
def get_patient_assessments(patient_id):
    """Get all assessments for a patient"""
    try:
        assessments = Assessment.query.filter_by(patient_id=patient_id).order_by(Assessment.created_at.desc()).all()
        
        result = []
        for assessment in assessments:
            result.append({
                'id': assessment.id,
                'primary_symptom': assessment.primary_symptom,
                'symptom_severity': assessment.symptom_severity,
                'triage_level': assessment.triage_level,
                'created_at': assessment.created_at.isoformat()
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/providers', methods=['GET'])
def get_healthcare_providers():
    """Get list of healthcare providers"""
    try:
        location = request.args.get('location')
        specialization = request.args.get('specialization')
        
        query = HealthcareProvider.query
        
        if location:
            query = query.filter(HealthcareProvider.location.ilike(f'%{location}%'))
        
        if specialization:
            query = query.filter(HealthcareProvider.specialization.ilike(f'%{specialization}%'))
        
        providers = query.all()
        
        result = []
        for provider in providers:
            result.append({
                'id': provider.id,
                'name': provider.name,
                'specialization': provider.specialization,
                'location': provider.location,
                'phone': provider.phone,
                'email': provider.email,
                'availability': provider.availability
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/emergency', methods=['POST'])
def emergency_alert():
    """Handle emergency alerts"""
    try:
        data = request.get_json()
        
        # Log emergency case
        print(f"EMERGENCY ALERT: Patient {data.get('patient_id')} - {data.get('symptoms')}")
        
        # In a real implementation, this would:
        # 1. Alert emergency services
        # 2. Notify nearby healthcare providers
        # 3. Send SMS/call to emergency contacts
        # 4. Update patient record with emergency status
        
        return jsonify({
            'message': 'Emergency alert sent successfully',
            'emergency_number': '108',
            'nearest_hospital': 'Contact local emergency services'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get system statistics"""
    try:
        total_patients = Patient.query.count()
        total_assessments = Assessment.query.count()
        total_consultations = Consultation.query.count()  # Added consultation stats
        emergency_cases = Assessment.query.filter_by(triage_level='emergency').count()
        urgent_cases = Assessment.query.filter_by(triage_level='urgent').count()
        routine_cases = Assessment.query.filter_by(triage_level='routine').count()
        
        return jsonify({
            'total_patients': total_patients,
            'total_assessments': total_assessments,
            'total_consultations': total_consultations,
            'emergency_cases': emergency_cases,
            'urgent_cases': urgent_cases,
            'routine_cases': routine_cases,
            'providers': HealthcareProvider.query.count()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()
    
    # Add sample healthcare providers
    if HealthcareProvider.query.count() == 0:
        sample_providers = [
            HealthcareProvider(
                name="Dr. Rajesh Kumar",
                specialization="General Medicine",
                location="Rural Health Center, Rajasthan",
                phone="+91-9876543210",
                email="dr.rajesh@rhc.gov.in",
                availability="Mon-Fri 9AM-5PM"
            ),
            HealthcareProvider(
                name="Dr. Priya Sharma",
                specialization="Pediatrics",
                location="Community Health Center, Uttar Pradesh",
                phone="+91-9876543211",
                email="dr.priya@chc.gov.in",
                availability="Mon-Sat 10AM-4PM"
            ),
            HealthcareProvider(
                name="Dr. Amit Patel",
                specialization="Emergency Medicine",
                location="District Hospital, Gujarat",
                phone="+91-9876543212",
                email="dr.amit@dh.gov.in",
                availability="24/7"
            )
        ]
        
        for provider in sample_providers:
            db.session.add(provider)
        
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
