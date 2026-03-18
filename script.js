// Healthcare AI Platform JavaScript
class HealthcareAI {
  constructor() {
    this.currentLanguage = "en"
    this.audioEnabled = false
    this.isListening = false
    this.recognition = null
    this.synthesis = window.speechSynthesis
    this.patientData = {}
    this.consultationCost = 50
    this.isEmergency = false
    this.messages = []

    this.emergencyKeywords = [
      "chest pain",
      "difficulty breathing",
      "severe bleeding",
      "unconscious",
      "heart attack",
      "stroke",
      "seizure",
      "severe headache",
      "can't breathe",
      "choking",
    ]

    this.languages = {
      en: "English",
      hi: "हिंदी (Hindi)",
      bn: "বাংলা (Bengali)",
      te: "తెలుగు (Telugu)",
      ta: "தமிழ் (Tamil)",
      mr: "मराठी (Marathi)",
      gu: "ગુજરાતી (Gujarati)",
      kn: "ಕನ್ನಡ (Kannada)",
      ml: "മലയാളം (Malayalam)",
      pa: "ਪੰਜਾਬੀ (Punjabi)",
    }

    this.responses = {
      en: [
        "Thank you for sharing your symptoms. Can you tell me when these symptoms started?",
        "I understand your concern. Let me ask a few more questions to better assess your condition.",
        "Based on what you've described, I'd like to know about your medical history.",
        "This sounds concerning. I recommend we schedule an immediate consultation.",
        "Can you rate your pain on a scale of 1-10?",
        "Have you experienced these symptoms before?",
        "Are you currently taking any medications?",
        "Do you have any known allergies?",
      ],
      hi: [
        "आपके लक्षण साझा करने के लिए धन्यवाद। क्या आप बता सकते हैं कि ये लक्षण कब शुरू हुए?",
        "मैं आपकी चिंता समझता हूं। आपकी स्थिति का बेहतर आकलन करने के लिए मुझे कुछ और प्रश्न पूछने दें।",
        "आपने जो बताया है, उसके आधार पर मैं आपके मेडिकल इतिहास के बारे में जानना चाहूंगा।",
        "यह चिंताजनक लगता है। मैं सुझाता हूं कि हम तुरंत परामर्श का समय निर्धारित करें।",
      ],
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.initSpeechRecognition()
    this.loadPatientData()
    this.populateHistory()
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })

    // Language selector
    document.getElementById("languageSelect").addEventListener("change", (e) => {
      this.changeLanguage(e.target.value)
    })

    // Audio toggle
    document.getElementById("audioToggle").addEventListener("click", () => {
      this.toggleAudio()
    })

    // Voice button
    document.getElementById("voiceButton").addEventListener("click", () => {
      this.toggleVoiceRecognition()
    })

    // Send button
    document.getElementById("sendButton").addEventListener("click", () => {
      this.sendMessage()
    })

    // Message input
    document.getElementById("messageInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // Patient form
    document.getElementById("patientForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.savePatientData()
    })

    // Real-time symptom analysis
    document.getElementById("messageInput").addEventListener("input", (e) => {
      this.analyzeSymptoms(e.target.value)
    })

    document.getElementById("patientSymptoms").addEventListener("input", (e) => {
      this.analyzeSymptoms(e.target.value)
    })
  }

  initSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = this.currentLanguage === "en" ? "en-US" : `${this.currentLanguage}-IN`

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        document.getElementById("messageInput").value = transcript
        this.stopListening()
        this.analyzeSymptoms(transcript)
      }

      this.recognition.onerror = () => {
        this.stopListening()
      }

      this.recognition.onend = () => {
        this.stopListening()
      }
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(tabName).classList.add("active")
  }

  changeLanguage(language) {
    this.currentLanguage = language
    if (this.recognition) {
      this.recognition.lang = language === "en" ? "en-US" : `${language}-IN`
    }
    this.updateUI()
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled
    const audioToggle = document.getElementById("audioToggle")
    audioToggle.classList.toggle("active", this.audioEnabled)
    this.updateCost()

    if (this.audioEnabled) {
      this.addCostFeature("Audio Support")
    } else {
      this.removeCostFeature("Audio Support")
    }
  }

  toggleVoiceRecognition() {
    if (this.isListening) {
      this.stopListening()
    } else {
      this.startListening()
    }
  }

  startListening() {
    if (this.recognition) {
      this.isListening = true
      this.recognition.start()

      document.getElementById("voiceButton").classList.add("listening")
      document.getElementById("listeningIndicator").classList.remove("hidden")
    }
  }

  stopListening() {
    if (this.recognition) {
      this.isListening = false
      this.recognition.stop()

      document.getElementById("voiceButton").classList.remove("listening")
      document.getElementById("listeningIndicator").classList.add("hidden")
    }
  }

  analyzeSymptoms(text) {
    const lowerText = text.toLowerCase()
    const hasEmergencyKeyword = this.emergencyKeywords.some((keyword) => lowerText.includes(keyword))

    this.isEmergency = hasEmergencyKeyword
    this.updateEmergencyAlert()
    this.updateCost()
    this.updateHealthStatus()
  }

  updateEmergencyAlert() {
    const alert = document.getElementById("emergencyAlert")
    if (this.isEmergency) {
      alert.classList.remove("hidden")
    } else {
      alert.classList.add("hidden")
    }
  }

  updateCost() {
    let baseCost = 50
    let costType = "Standard Consultation"

    if (this.isEmergency) {
      baseCost = 200
      costType = "Emergency Consultation"
    } else if (this.audioEnabled) {
      baseCost = 80
      costType = "Premium Consultation"
    }

    this.consultationCost = baseCost
    document.getElementById("costAmount").textContent = `₹${baseCost}`
    document.getElementById("costType").textContent = costType
  }

  updateHealthStatus() {
    const riskLevel = document.getElementById("riskLevel")
    const responseTime = document.getElementById("responseTime")

    if (this.isEmergency) {
      riskLevel.textContent = "High"
      riskLevel.className = "status-badge high"
      responseTime.textContent = "Immediate"
    } else {
      riskLevel.textContent = "Low"
      riskLevel.className = "status-badge low"
      responseTime.textContent = "< 5 min"
    }
  }

  addCostFeature(feature) {
    const featuresContainer = document.getElementById("costFeatures")
    const badge = document.createElement("div")
    badge.className = "feature-badge"
    badge.textContent = `+ ${feature}`
    featuresContainer.appendChild(badge)
  }

  removeCostFeature(feature) {
    const featuresContainer = document.getElementById("costFeatures")
    const badges = featuresContainer.querySelectorAll(".feature-badge")
    badges.forEach((badge) => {
      if (badge.textContent.includes(feature)) {
        badge.remove()
      }
    })
  }

  sendMessage() {
    const input = document.getElementById("messageInput")
    const message = input.value.trim()

    if (message) {
      this.addMessage(message, "user")
      input.value = ""

      // Simulate AI response
      setTimeout(() => {
        const response = this.generateDoctorResponse(message)
        this.addMessage(response, "doctor")

        if (this.audioEnabled) {
          this.speakText(response)
        }
      }, 1000)
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById("chatMessages")
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}`

    const bubbleDiv = document.createElement("div")
    bubbleDiv.className = `message-bubble ${sender}`

    if (sender === "doctor") {
      const avatarDiv = document.createElement("div")
      avatarDiv.className = "doctor-avatar"
      avatarDiv.innerHTML = '<img src="/caring-doctor.png" alt="AI Doctor" />'
      messageDiv.appendChild(avatarDiv)
    }

    bubbleDiv.textContent = content
    messageDiv.appendChild(bubbleDiv)

    // Remove welcome message if it exists
    const welcomeMessage = messagesContainer.querySelector(".welcome-message")
    if (welcomeMessage && messagesContainer.children.length === 1) {
      welcomeMessage.remove()
    }

    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Store message
    this.messages.push({
      content,
      sender,
      timestamp: new Date(),
      language: this.currentLanguage,
    })
  }

  generateDoctorResponse(userMessage) {
    const responses = this.responses[this.currentLanguage] || this.responses["en"]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Add contextual responses based on keywords
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("pain")) {
      return this.currentLanguage === "hi"
        ? "दर्द के बारे में बताने के लिए धन्यवाद। क्या आप 1-10 के पैमाने पर अपने दर्द को रेट कर सकते हैं?"
        : "Thank you for telling me about the pain. Can you rate your pain on a scale of 1-10?"
    }

    if (lowerMessage.includes("fever")) {
      return this.currentLanguage === "hi"
        ? "बुखार कितने दिनों से है? क्या आपने तापमान मापा है?"
        : "How long have you had the fever? Have you measured your temperature?"
    }

    return randomResponse
  }

  speakText(text) {
    if (this.synthesis && this.audioEnabled) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = this.currentLanguage === "en" ? "en-US" : `${this.currentLanguage}-IN`
      utterance.rate = 0.9
      utterance.pitch = 1
      this.synthesis.speak(utterance)
    }
  }

  savePatientData() {
    const formData = {
      name: document.getElementById("patientName").value,
      age: document.getElementById("patientAge").value,
      gender: document.getElementById("patientGender").value,
      language: document.getElementById("patientLanguage").value,
      symptoms: document.getElementById("patientSymptoms").value,
      medicalHistory: document.getElementById("patientHistory").value,
      timestamp: new Date(),
    }

    this.patientData = formData
    localStorage.setItem("patientData", JSON.stringify(formData))

    // Show success message
    alert("Patient information saved successfully!")

    // Analyze symptoms from form
    this.analyzeSymptoms(formData.symptoms)
  }

  loadPatientData() {
    const savedData = localStorage.getItem("patientData")
    if (savedData) {
      this.patientData = JSON.parse(savedData)
      this.populatePatientForm()
    }
  }

  populatePatientForm() {
    if (this.patientData.name) {
      document.getElementById("patientName").value = this.patientData.name || ""
      document.getElementById("patientAge").value = this.patientData.age || ""
      document.getElementById("patientGender").value = this.patientData.gender || ""
      document.getElementById("patientLanguage").value = this.patientData.language || "en"
      document.getElementById("patientSymptoms").value = this.patientData.symptoms || ""
      document.getElementById("patientHistory").value = this.patientData.medicalHistory || ""
    }
  }

  populateHistory() {
    const historyList = document.getElementById("historyList")
    const sampleHistory = [
      {
        id: 1,
        type: "AI Doctor Consultation",
        symptoms: "Headache, fever",
        diagnosis: "Viral infection",
        cost: 200,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        type: "AI Doctor Consultation",
        symptoms: "Stomach pain, nausea",
        diagnosis: "Gastritis",
        cost: 80,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        type: "AI Doctor Consultation",
        symptoms: "Cough, sore throat",
        diagnosis: "Common cold",
        cost: 50,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]

    historyList.innerHTML = ""

    sampleHistory.forEach((item) => {
      const historyItem = document.createElement("div")
      historyItem.className = "history-item"
      historyItem.innerHTML = `
                <div class="history-avatar">
                    <img src="/caring-doctor.png" alt="AI Doctor" />
                </div>
                <div class="history-content">
                    <h4>${item.type}</h4>
                    <p>Symptoms: ${item.symptoms} - Diagnosis: ${item.diagnosis}</p>
                    <div class="history-date">${item.date.toLocaleDateString()}</div>
                </div>
                <div class="history-actions">
                    <div class="history-cost">₹${item.cost}</div>
                    <button class="history-view">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                    </button>
                </div>
            `
      historyList.appendChild(historyItem)
    })
  }

  updateUI() {
    // Update any language-specific UI elements
    const languageSelect = document.getElementById("languageSelect")
    languageSelect.value = this.currentLanguage
  }

  // API Integration methods (to be connected with Python backend)
  async sendToAI(message) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          language: this.currentLanguage,
          patientData: this.patientData,
          isEmergency: this.isEmergency,
        }),
      })

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Error communicating with AI:", error)
      return this.generateDoctorResponse(message)
    }
  }

  async saveConsultation(messages) {
    try {
      await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientData: this.patientData,
          messages: messages,
          cost: this.consultationCost,
          isEmergency: this.isEmergency,
          timestamp: new Date(),
        }),
      })
    } catch (error) {
      console.error("Error saving consultation:", error)
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.healthcareAI = new HealthcareAI()
})

// Service Worker for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}
