import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'healthcare-ai-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///healthcare.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Ayushman Bharat Integration
    AYUSHMAN_BHARAT_API_URL = os.environ.get('AYUSHMAN_BHARAT_API_URL')
    AYUSHMAN_BHARAT_API_KEY = os.environ.get('AYUSHMAN_BHARAT_API_KEY')
    
    # Emergency Services
    EMERGENCY_CONTACTS = {
        'ambulance': '108',
        'police': '100',
        'fire': '101',
        'women_helpline': '1091',
        'child_helpline': '1098'
    }
    
    # Supported Languages
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'hi': 'Hindi',
        'bn': 'Bengali',
        'te': 'Telugu',
        'ta': 'Tamil',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi'
    }
    
    # Pricing Configuration
    PRICING = {
        'basic': 50,
        'premium': 80,
        'emergency': 200,
        'audio_support': 30,
        'video_support': 50
    }

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
