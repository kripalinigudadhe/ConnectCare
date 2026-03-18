-- Rural Health Connect Database Schema

-- Patients table
CREATE TABLE IF NOT EXISTS patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    medical_conditions TEXT, -- JSON string
    medications TEXT,
    smoking VARCHAR(10),
    alcohol VARCHAR(10),
    exercise VARCHAR(20),
    pregnancy VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    primary_symptom VARCHAR(50) NOT NULL,
    symptom_onset VARCHAR(20) NOT NULL,
    symptom_severity VARCHAR(20) NOT NULL,
    additional_symptoms TEXT, -- JSON string
    pain_description TEXT,
    breathing_details TEXT, -- JSON string
    emergency_symptoms TEXT, -- JSON string
    triage_level VARCHAR(20) NOT NULL,
    ai_recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient (id)
);

-- Healthcare providers table
CREATE TABLE IF NOT EXISTS healthcare_provider (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    location VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    availability VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_phone ON patient(phone);
CREATE INDEX IF NOT EXISTS idx_assessment_patient_id ON assessment(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_triage_level ON assessment(triage_level);
CREATE INDEX IF NOT EXISTS idx_assessment_created_at ON assessment(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_location ON healthcare_provider(location);
CREATE INDEX IF NOT EXISTS idx_provider_specialization ON healthcare_provider(specialization);

-- Sample data for healthcare providers
INSERT OR IGNORE INTO healthcare_provider (name, specialization, location, phone, email, availability) VALUES
('Dr. Rajesh Kumar', 'General Medicine', 'Rural Health Center, Rajasthan', '+91-9876543210', 'dr.rajesh@rhc.gov.in', 'Mon-Fri 9AM-5PM'),
('Dr. Priya Sharma', 'Pediatrics', 'Community Health Center, Uttar Pradesh', '+91-9876543211', 'dr.priya@chc.gov.in', 'Mon-Sat 10AM-4PM'),
('Dr. Amit Patel', 'Emergency Medicine', 'District Hospital, Gujarat', '+91-9876543212', 'dr.amit@dh.gov.in', '24/7'),
('Dr. Sunita Reddy', 'Gynecology', 'Primary Health Center, Andhra Pradesh', '+91-9876543213', 'dr.sunita@phc.gov.in', 'Mon-Fri 10AM-3PM'),
('Dr. Vikram Singh', 'Orthopedics', 'Sub District Hospital, Punjab', '+91-9876543214', 'dr.vikram@sdh.gov.in', 'Tue-Sat 11AM-4PM');
