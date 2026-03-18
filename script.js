// Main JavaScript file for Rural Health Connect
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the application
  initializeApp()
})

function initializeApp() {
  // Set up navigation
  setupNavigation()

  // Set up form handlers
  setupFormHandlers()

  // Set up mobile menu if needed
  setupMobileMenu()

  console.log("Rural Health Connect initialized")
}

function setupNavigation() {
  // Highlight active navigation item
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll(".nav-menu a")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    if (href === currentPage) {
      link.classList.add("active")
    }
  })
}

function setupFormHandlers() {
  // Registration form handler
  const registrationForm = document.getElementById("registrationForm")
  if (registrationForm) {
    registrationForm.addEventListener("submit", handleRegistrationSubmit)

    // Show/hide pregnancy question based on gender
    const genderSelect = document.getElementById("gender")
    const pregnancyGroup = document.getElementById("pregnancyGroup")

    if (genderSelect && pregnancyGroup) {
      genderSelect.addEventListener("change", function () {
        if (this.value === "female") {
          pregnancyGroup.style.display = "block"
        } else {
          pregnancyGroup.style.display = "none"
        }
      })
    }

    // Handle "none" checkbox for medical conditions
    const conditionCheckboxes = document.querySelectorAll('input[name="conditions"]')
    const noneCheckbox = document.querySelector('input[name="conditions"][value="none"]')

    if (noneCheckbox) {
      noneCheckbox.addEventListener("change", function () {
        if (this.checked) {
          conditionCheckboxes.forEach((checkbox) => {
            if (checkbox !== this) {
              checkbox.checked = false
            }
          })
        }
      })

      conditionCheckboxes.forEach((checkbox) => {
        if (checkbox !== noneCheckbox) {
          checkbox.addEventListener("change", function () {
            if (this.checked) {
              noneCheckbox.checked = false
            }
          })
        }
      })
    }
  }

  // Contact form handler
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit)
  }
}

function handleRegistrationSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const patientData = {}

  // Collect form data
  for (const [key, value] of formData.entries()) {
    if (key === "conditions") {
      if (!patientData.conditions) {
        patientData.conditions = []
      }
      patientData.conditions.push(value)
    } else {
      patientData[key] = value
    }
  }

  // Validate required fields
  if (!patientData.fullName || !patientData.age || !patientData.gender) {
    showNotification("Please fill in all required fields.", "error")
    return
  }

  // Store patient data in localStorage
  localStorage.setItem("patientData", JSON.stringify(patientData))

  showNotification("Registration successful! Redirecting to symptom checker...", "success")

  // Redirect to symptom checker after a short delay
  setTimeout(() => {
    window.location.href = "symptom-checker.html"
  }, 1500)
}

function handleContactSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const contactData = {}

  for (const [key, value] of formData.entries()) {
    contactData[key] = value
  }

  // Validate required fields
  if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
    showNotification("Please fill in all required fields.", "error")
    return
  }

  // Simulate form submission
  showNotification("Thank you for your message! We will get back to you within 24 hours.", "success")

  // Reset form
  event.target.reset()
}

function setupMobileMenu() {
  // Add mobile menu toggle if needed
  const nav = document.querySelector(".nav")
  const navMenu = document.querySelector(".nav-menu")

  if (window.innerWidth <= 768) {
    // Create mobile menu button if it doesn't exist
    let mobileMenuBtn = document.querySelector(".mobile-menu-btn")
    if (!mobileMenuBtn) {
      mobileMenuBtn = document.createElement("button")
      mobileMenuBtn.className = "mobile-menu-btn"
      mobileMenuBtn.innerHTML = "☰"
      mobileMenuBtn.style.cssText = `
                display: block;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--primary-color);
            `

      nav.appendChild(mobileMenuBtn)

      mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("mobile-open")
      })
    }
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  // Style the notification
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

  // Set background color based on type
  switch (type) {
    case "success":
      notification.style.backgroundColor = "var(--success-color)"
      break
    case "error":
      notification.style.backgroundColor = "var(--error-color)"
      break
    case "warning":
      notification.style.backgroundColor = "var(--warning-color)"
      break
    default:
      notification.style.backgroundColor = "var(--primary-color)"
  }

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 5000)
}

// Utility functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Export functions for use in other scripts
window.RuralHealthConnect = {
  showNotification,
  validateEmail,
  validatePhone,
  formatDate,
}
