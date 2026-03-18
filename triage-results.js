// Triage Results JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeResults()
})

function initializeResults() {
  const triageLevel = localStorage.getItem("triageLevel")
  const symptomData = JSON.parse(localStorage.getItem("symptomData") || "{}")
  const patientData = JSON.parse(localStorage.getItem("patientData") || "{}")

  if (!triageLevel || !symptomData) {
    window.RuralHealthConnect.showNotification(
      "No assessment data found. Please complete the symptom checker first.",
      "error",
    )
    setTimeout(() => {
      window.location.href = "symptom-checker.html"
    }, 2000)
    return
  }

  displayTriageResult(triageLevel, symptomData, patientData)
  displayRecommendations(triageLevel, symptomData, patientData)
}

function displayTriageResult(triageLevel, symptomData, patientData) {
  const triageResult = document.getElementById("triageResult")
  if (!triageResult) return

  const resultConfig = getTriageConfig(triageLevel)

  triageResult.className = `triage-result triage-${triageLevel}`
  triageResult.innerHTML = `
        <div class="result-icon">${resultConfig.icon}</div>
        <h3>${resultConfig.title}</h3>
        <p class="result-description">${resultConfig.description}</p>
        <div class="urgency-level">
            <span class="urgency-label">Priority Level:</span>
            <span class="urgency-value ${triageLevel}">${resultConfig.urgency}</span>
        </div>
    `
}

function displayRecommendations(triageLevel, symptomData, patientData) {
  const recommendations = document.getElementById("recommendations")
  if (!recommendations) return

  const config = getTriageConfig(triageLevel)
  const specificRecommendations = generateSpecificRecommendations(symptomData, patientData)

  recommendations.innerHTML = `
        <div class="recommendations-content">
            <h3>Recommended Actions</h3>
            <div class="recommendation-cards">
                ${config.recommendations
                  .map(
                    (rec) => `
                    <div class="recommendation-card ${rec.type}">
                        <div class="rec-icon">${rec.icon}</div>
                        <div class="rec-content">
                            <h4>${rec.title}</h4>
                            <p>${rec.description}</p>
                            ${rec.action ? `<div class="rec-action">${rec.action}</div>` : ""}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            ${
              specificRecommendations.length > 0
                ? `
                <div class="specific-recommendations">
                    <h4>Additional Recommendations Based on Your Symptoms</h4>
                    <ul>
                        ${specificRecommendations.map((rec) => `<li>${rec}</li>`).join("")}
                    </ul>
                </div>
            `
                : ""
            }
            
            <div class="ayushman-info">
                <h4>🏥 Ayushman Bharat Digital Health Mission</h4>
                <p>Your health record can be integrated with India's Digital Health Mission for seamless healthcare access. Contact your nearest healthcare provider for more information.</p>
            </div>
        </div>
    `
}

function getTriageConfig(triageLevel) {
  const configs = {
    emergency: {
      icon: "🚨",
      title: "Emergency Care Needed",
      description:
        "Your symptoms indicate that you need immediate medical attention. Please seek emergency care right away.",
      urgency: "IMMEDIATE",
      recommendations: [
        {
          type: "emergency",
          icon: "🚑",
          title: "Call Emergency Services",
          description: "Call 108 (National Ambulance Service) or go to the nearest emergency room immediately.",
          action: "Call 108 Now",
        },
        {
          type: "urgent",
          icon: "🏥",
          title: "Visit Emergency Room",
          description: "If emergency services are not available, go to the nearest hospital emergency room.",
          action: "Find Nearest Hospital",
        },
        {
          type: "support",
          icon: "👨‍⚕️",
          title: "Inform Healthcare Provider",
          description: "If possible, contact your regular healthcare provider to inform them of your condition.",
          action: "Contact Doctor",
        },
      ],
    },
    urgent: {
      icon: "⚠️",
      title: "Urgent Medical Attention Required",
      description: "Your symptoms suggest you should see a healthcare provider within the next 24 hours.",
      urgency: "WITHIN 24 HOURS",
      recommendations: [
        {
          type: "urgent",
          icon: "👨‍⚕️",
          title: "Contact Healthcare Provider",
          description: "Call your doctor or visit a clinic within the next 24 hours.",
          action: "Schedule Appointment",
        },
        {
          type: "monitor",
          icon: "📊",
          title: "Monitor Symptoms",
          description: "Keep track of your symptoms and seek immediate care if they worsen.",
          action: "Track Symptoms",
        },
        {
          type: "care",
          icon: "🏠",
          title: "Self-Care Measures",
          description: "Follow appropriate self-care measures while waiting for medical attention.",
          action: "View Self-Care Tips",
        },
      ],
    },
    routine: {
      icon: "✅",
      title: "Routine Care Recommended",
      description: "Your symptoms can likely be managed with routine care and self-care measures.",
      urgency: "ROUTINE",
      recommendations: [
        {
          type: "routine",
          icon: "📅",
          title: "Schedule Regular Checkup",
          description: "Consider scheduling a routine appointment with your healthcare provider.",
          action: "Book Appointment",
        },
        {
          type: "selfcare",
          icon: "🏠",
          title: "Self-Care Management",
          description: "Continue with appropriate self-care measures and monitor your symptoms.",
          action: "View Self-Care Guide",
        },
        {
          type: "monitor",
          icon: "👁️",
          title: "Watch for Changes",
          description: "Monitor your symptoms and seek medical care if they worsen or persist.",
          action: "Symptom Monitoring Tips",
        },
      ],
    },
  }

  return configs[triageLevel] || configs.routine
}

function generateSpecificRecommendations(symptomData, patientData) {
  const recommendations = []

  // Fever-specific recommendations
  if (
    symptomData.primary_symptom === "fever" ||
    (symptomData.additional_symptoms && symptomData.additional_symptoms.includes("fever"))
  ) {
    recommendations.push("Stay hydrated by drinking plenty of fluids")
    recommendations.push("Rest and avoid strenuous activities")
    recommendations.push("Use fever-reducing medications as appropriate (consult pharmacist)")
  }

  // Cough recommendations
  if (symptomData.primary_symptom === "cough") {
    recommendations.push("Stay hydrated to help thin mucus")
    recommendations.push("Use honey or warm salt water gargles for throat irritation")
    recommendations.push("Avoid smoking and secondhand smoke")
  }

  // Breathing difficulty
  if (symptomData.primary_symptom === "breathing_difficulty") {
    recommendations.push("Sit upright and try to stay calm")
    recommendations.push("Avoid triggers like smoke, dust, or strong odors")
    recommendations.push("Use prescribed inhalers if you have them")
  }

  // Headache recommendations
  if (symptomData.primary_symptom === "headache") {
    recommendations.push("Rest in a quiet, dark room")
    recommendations.push("Apply cold or warm compress to head or neck")
    recommendations.push("Stay hydrated and maintain regular sleep schedule")
  }

  // Abdominal pain
  if (symptomData.primary_symptom === "abdominal_pain") {
    recommendations.push("Avoid solid foods until symptoms improve")
    recommendations.push("Try clear liquids and bland foods when ready")
    recommendations.push("Apply heat pad to abdomen for comfort (if no fever)")
  }

  // High-risk patient recommendations
  if (patientData.conditions && patientData.conditions.length > 0 && !patientData.conditions.includes("none")) {
    recommendations.push("Monitor symptoms closely due to your medical history")
    recommendations.push("Contact your regular healthcare provider for guidance")
  }

  // Age-specific recommendations
  if (patientData.age && Number.parseInt(patientData.age) >= 65) {
    recommendations.push("Consider seeking medical attention sooner due to age-related risk factors")
  }

  // Pregnancy-specific recommendations
  if (patientData.pregnancy === "yes") {
    recommendations.push("Contact your obstetrician or midwife for pregnancy-specific guidance")
    recommendations.push("Avoid medications without consulting healthcare provider")
  }

  return recommendations
}

// Add CSS for the results page
const resultStyles = `
    <style>
        .result-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .result-description {
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .urgency-level {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .urgency-label {
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        .urgency-value {
            font-weight: 700;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            color: white;
        }
        
        .urgency-value.emergency {
            background-color: var(--error-color);
        }
        
        .urgency-value.urgent {
            background-color: var(--warning-color);
        }
        
        .urgency-value.routine {
            background-color: var(--success-color);
        }
        
        .recommendations-content {
            background-color: var(--background-color);
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: var(--shadow-md);
        }
        
        .recommendations-content h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .recommendation-cards {
            display: grid;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .recommendation-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
            border-radius: 0.75rem;
            border-left: 4px solid;
        }
        
        .recommendation-card.emergency {
            background-color: #fef2f2;
            border-left-color: var(--error-color);
        }
        
        .recommendation-card.urgent {
            background-color: #fffbeb;
            border-left-color: var(--warning-color);
        }
        
        .recommendation-card.routine,
        .recommendation-card.selfcare,
        .recommendation-card.monitor,
        .recommendation-card.care,
        .recommendation-card.support {
            background-color: #f0fdf4;
            border-left-color: var(--success-color);
        }
        
        .rec-icon {
            font-size: 2rem;
            flex-shrink: 0;
        }
        
        .rec-content h4 {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .rec-content p {
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 0.5rem;
        }
        
        .rec-action {
            font-weight: 500;
            color: var(--secondary-color);
            font-size: 0.875rem;
        }
        
        .specific-recommendations {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: var(--card-background);
            border-radius: 0.75rem;
        }
        
        .specific-recommendations h4 {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .specific-recommendations ul {
            list-style-type: disc;
            padding-left: 1.5rem;
        }
        
        .specific-recommendations li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }
        
        .ayushman-info {
            padding: 1.5rem;
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 0.75rem;
        }
        
        .ayushman-info h4 {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .ayushman-info p {
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .recommendation-card {
                flex-direction: column;
                text-align: center;
            }
            
            .rec-icon {
                align-self: center;
            }
        }
    </style>
`

// Inject styles
document.head.insertAdjacentHTML("beforeend", resultStyles)
