// Symptom Checker JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeSymptomChecker()
})

// Symptom checker questions and logic
const symptomQuestions = [
  {
    id: "primary_symptom",
    type: "select",
    question: "What is your primary symptom?",
    required: true,
    options: [
      { value: "fever", label: "Fever" },
      { value: "cough", label: "Cough" },
      { value: "headache", label: "Headache" },
      { value: "chest_pain", label: "Chest Pain" },
      { value: "abdominal_pain", label: "Abdominal Pain" },
      { value: "breathing_difficulty", label: "Difficulty Breathing" },
      { value: "nausea_vomiting", label: "Nausea/Vomiting" },
      { value: "diarrhea", label: "Diarrhea" },
      { value: "fatigue", label: "Fatigue/Weakness" },
      { value: "dizziness", label: "Dizziness" },
      { value: "rash", label: "Skin Rash" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "symptom_onset",
    type: "select",
    question: "When did your symptoms start?",
    required: true,
    options: [
      { value: "today", label: "Today" },
      { value: "1-2_days", label: "1-2 days ago" },
      { value: "3-7_days", label: "3-7 days ago" },
      { value: "1-2_weeks", label: "1-2 weeks ago" },
      { value: "more_than_2_weeks", label: "More than 2 weeks ago" },
    ],
  },
  {
    id: "symptom_severity",
    type: "select",
    question: "How would you rate the severity of your symptoms?",
    required: true,
    options: [
      { value: "mild", label: "Mild - Barely noticeable" },
      { value: "moderate", label: "Moderate - Noticeable but manageable" },
      { value: "severe", label: "Severe - Significantly affecting daily activities" },
      { value: "very_severe", label: "Very Severe - Unable to perform normal activities" },
    ],
  },
  {
    id: "additional_symptoms",
    type: "checkbox",
    question: "Do you have any of these additional symptoms?",
    required: false,
    options: [
      { value: "fever", label: "Fever (temperature above 100.4°F/38°C)" },
      { value: "chills", label: "Chills" },
      { value: "sweating", label: "Excessive sweating" },
      { value: "loss_of_appetite", label: "Loss of appetite" },
      { value: "weight_loss", label: "Unexplained weight loss" },
      { value: "sleep_problems", label: "Sleep problems" },
      { value: "confusion", label: "Confusion or disorientation" },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    id: "pain_location",
    type: "conditional",
    condition: (answers) => ["chest_pain", "abdominal_pain", "headache"].includes(answers.primary_symptom),
    question: "Can you describe the location and type of pain?",
    type: "textarea",
    required: true,
    placeholder:
      "Please describe where exactly you feel the pain and what it feels like (sharp, dull, throbbing, etc.)",
  },
  {
    id: "breathing_details",
    type: "conditional",
    condition: (answers) => answers.primary_symptom === "breathing_difficulty",
    question: "When do you experience breathing difficulty?",
    type: "checkbox",
    required: true,
    options: [
      { value: "at_rest", label: "At rest" },
      { value: "with_activity", label: "With physical activity" },
      { value: "lying_down", label: "When lying down" },
      { value: "at_night", label: "At night" },
      { value: "all_times", label: "All the time" },
    ],
  },
  {
    id: "emergency_symptoms",
    type: "checkbox",
    question: "Are you experiencing any of these emergency symptoms?",
    required: true,
    options: [
      { value: "severe_chest_pain", label: "Severe chest pain or pressure" },
      { value: "difficulty_breathing", label: "Severe difficulty breathing" },
      { value: "loss_of_consciousness", label: "Loss of consciousness or fainting" },
      { value: "severe_bleeding", label: "Severe bleeding" },
      { value: "severe_abdominal_pain", label: "Severe abdominal pain" },
      { value: "high_fever", label: "Very high fever (above 103°F/39.4°C)" },
      { value: "seizures", label: "Seizures" },
      { value: "severe_headache", label: "Sudden severe headache" },
      { value: "paralysis", label: "Sudden weakness or paralysis" },
      { value: "none", label: "None of the above" },
    ],
  },
]

let currentQuestionIndex = 0
const symptomAnswers = {}

function initializeSymptomChecker() {
  // Check if patient data exists
  const patientData = localStorage.getItem("patientData")
  if (!patientData) {
    if (confirm("Please complete your registration first. Would you like to go to the registration page?")) {
      window.location.href = "registration.html"
      return
    }
  }

  displayCurrentQuestion()
  setupEventListeners()
}

function setupEventListeners() {
  const nextBtn = document.getElementById("nextBtn")
  const prevBtn = document.getElementById("prevBtn")
  const submitBtn = document.getElementById("submitBtn")
  const symptomForm = document.getElementById("symptomForm")

  if (nextBtn) {
    nextBtn.addEventListener("click", handleNext)
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", handlePrevious)
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit)
  }

  if (symptomForm) {
    symptomForm.addEventListener("submit", (e) => {
      e.preventDefault()
      handleSubmit()
    })
  }
}

function displayCurrentQuestion() {
  const question = getValidQuestions()[currentQuestionIndex]
  if (!question) return

  const questionContainer = document.getElementById("questionContainer")
  const progressFill = document.getElementById("progressFill")
  const validQuestions = getValidQuestions()

  // Update progress bar
  const progress = ((currentQuestionIndex + 1) / validQuestions.length) * 100
  if (progressFill) {
    progressFill.style.width = `${progress}%`
  }

  // Generate question HTML
  const questionHTML = `
        <div class="question">
            <h3>${question.question}</h3>
            ${generateQuestionInput(question)}
        </div>
    `

  if (questionContainer) {
    questionContainer.innerHTML = questionHTML
  }

  // Update button visibility
  updateButtonVisibility()

  // Pre-fill answers if they exist
  prefillAnswers(question)
}

function generateQuestionInput(question) {
  switch (question.type) {
    case "select":
      return `
                <select id="${question.id}" name="${question.id}" ${question.required ? "required" : ""}>
                    <option value="">Select an option</option>
                    ${question.options
                      .map((option) => `<option value="${option.value}">${option.label}</option>`)
                      .join("")}
                </select>
            `

    case "checkbox":
      return `
                <div class="checkbox-group">
                    ${question.options
                      .map(
                        (option) => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="${question.id}" value="${option.value}">
                            <span class="checkmark"></span>
                            ${option.label}
                        </label>
                    `,
                      )
                      .join("")}
                </div>
            `

    case "textarea":
      return `
                <textarea id="${question.id}" name="${question.id}" rows="4" 
                    placeholder="${question.placeholder || ""}" 
                    ${question.required ? "required" : ""}></textarea>
            `

    default:
      return `<input type="text" id="${question.id}" name="${question.id}" ${question.required ? "required" : ""}>`
  }
}

function getValidQuestions() {
  return symptomQuestions.filter((question) => {
    if (question.type === "conditional") {
      return question.condition(symptomAnswers)
    }
    return true
  })
}

function prefillAnswers(question) {
  const answer = symptomAnswers[question.id]
  if (!answer) return

  if (question.type === "checkbox") {
    const checkboxes = document.querySelectorAll(`input[name="${question.id}"]`)
    checkboxes.forEach((checkbox) => {
      if (Array.isArray(answer) && answer.includes(checkbox.value)) {
        checkbox.checked = true
      }
    })
  } else {
    const input = document.getElementById(question.id)
    if (input) {
      input.value = answer
    }
  }
}

function collectCurrentAnswer() {
  const question = getValidQuestions()[currentQuestionIndex]
  if (!question) return

  if (question.type === "checkbox") {
    const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`)
    symptomAnswers[question.id] = Array.from(checkboxes).map((cb) => cb.value)

    // Handle "none" option
    if (symptomAnswers[question.id].includes("none")) {
      symptomAnswers[question.id] = ["none"]
    }
  } else {
    const input = document.getElementById(question.id)
    if (input) {
      symptomAnswers[question.id] = input.value
    }
  }
}

function validateCurrentAnswer() {
  const question = getValidQuestions()[currentQuestionIndex]
  if (!question || !question.required) return true

  const answer = symptomAnswers[question.id]

  if (question.type === "checkbox") {
    return Array.isArray(answer) && answer.length > 0
  }

  return answer && answer.trim() !== ""
}

function handleNext() {
  collectCurrentAnswer()

  if (!validateCurrentAnswer()) {
    window.RuralHealthConnect.showNotification("Please answer the required question before continuing.", "error")
    return
  }

  const validQuestions = getValidQuestions()
  if (currentQuestionIndex < validQuestions.length - 1) {
    currentQuestionIndex++
    displayCurrentQuestion()
  }
}

function handlePrevious() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--
    displayCurrentQuestion()
  }
}

function handleSubmit() {
  collectCurrentAnswer()

  if (!validateCurrentAnswer()) {
    window.RuralHealthConnect.showNotification("Please answer the required question before submitting.", "error")
    return
  }

  // Store symptom data
  localStorage.setItem("symptomData", JSON.stringify(symptomAnswers))

  // Calculate triage level
  const triageLevel = calculateTriageLevel(symptomAnswers)
  localStorage.setItem("triageLevel", triageLevel)

  window.RuralHealthConnect.showNotification("Assessment complete! Redirecting to results...", "success")

  // Redirect to results page
  setTimeout(() => {
    window.location.href = "triage-results.html"
  }, 1500)
}

function calculateTriageLevel(answers) {
  // Emergency conditions
  const emergencySymptoms = answers.emergency_symptoms || []
  if (emergencySymptoms.length > 0 && !emergencySymptoms.includes("none")) {
    return "emergency"
  }

  // Check for severe symptoms
  if (answers.symptom_severity === "very_severe") {
    return "emergency"
  }

  // Check for urgent conditions
  const urgentConditions = [
    answers.primary_symptom === "chest_pain" && answers.symptom_severity === "severe",
    answers.primary_symptom === "breathing_difficulty",
    answers.symptom_severity === "severe" && ["fever", "abdominal_pain"].includes(answers.primary_symptom),
    answers.symptom_onset === "today" && answers.symptom_severity === "severe",
  ]

  if (urgentConditions.some((condition) => condition)) {
    return "urgent"
  }

  // Check for moderate severity or concerning symptoms
  if (
    answers.symptom_severity === "severe" ||
    (answers.symptom_severity === "moderate" &&
      ["fever", "chest_pain", "abdominal_pain"].includes(answers.primary_symptom))
  ) {
    return "urgent"
  }

  // Default to routine care
  return "routine"
}

function updateButtonVisibility() {
  const nextBtn = document.getElementById("nextBtn")
  const prevBtn = document.getElementById("prevBtn")
  const submitBtn = document.getElementById("submitBtn")
  const validQuestions = getValidQuestions()

  // Show/hide previous button
  if (prevBtn) {
    prevBtn.style.display = currentQuestionIndex > 0 ? "inline-flex" : "none"
  }

  // Show/hide next and submit buttons
  const isLastQuestion = currentQuestionIndex >= validQuestions.length - 1

  if (nextBtn) {
    nextBtn.style.display = isLastQuestion ? "none" : "inline-flex"
  }

  if (submitBtn) {
    submitBtn.style.display = isLastQuestion ? "inline-flex" : "none"
  }
}

// Handle checkbox "none" option
document.addEventListener("change", (e) => {
  if (e.target.type === "checkbox" && e.target.value === "none") {
    const checkboxGroup = e.target.closest(".checkbox-group")
    if (checkboxGroup) {
      const otherCheckboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]:not([value="none"])')
      if (e.target.checked) {
        otherCheckboxes.forEach((cb) => (cb.checked = false))
      }
    }
  } else if (e.target.type === "checkbox" && e.target.value !== "none") {
    const checkboxGroup = e.target.closest(".checkbox-group")
    if (checkboxGroup) {
      const noneCheckbox = checkboxGroup.querySelector('input[value="none"]')
      if (noneCheckbox && e.target.checked) {
        noneCheckbox.checked = false
      }
    }
  }
})
