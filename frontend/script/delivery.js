// Delivery & Payment Page JavaScript
import { showToast } from "../utils/toast-notification.js";

// DOM Elements
const deliveryForm = document.getElementById("delivery-request-form");
const faqQuestions = document.querySelectorAll(".faq-question");
const deliveryDateInput = document.getElementById("delivery-date");

// Set minimum date to today
function setMinDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  deliveryDateInput.setAttribute("min", minDate);
}

// Initialize date picker
if (deliveryDateInput) {
  setMinDate();
}

// Form Validation
function validateForm(formData) {
  const errors = [];

  // Name validation
  if (!formData.name || formData.name.trim().length < 2) {
    errors.push("Please enter your full name");
  }

  // Phone validation
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
    errors.push("Please enter a valid phone number");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email.trim())) {
    errors.push("Please enter a valid email address");
  }

  // Delivery method validation
  if (!formData.method) {
    errors.push("Please select a delivery method");
  }

  // Address validation for local delivery
  if (formData.method === "local") {
    if (!formData.address || formData.address.trim().length < 5) {
      errors.push("Please enter your delivery address");
    }
    if (!formData.city || formData.city.trim().length < 2) {
      errors.push("Please enter your city");
    }
    if (!formData.zip || formData.zip.trim().length < 5) {
      errors.push("Please enter your ZIP code");
    }
  }

  // Date validation
  if (!formData.date) {
    errors.push("Please select a delivery date");
  }

  return errors;
}

// Format phone number
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, "");
  let formattedValue = "";

  if (value.length > 0) {
    formattedValue += "+1 ";
  }
  if (value.length > 1) {
    formattedValue += "(" + value.substring(1, 4);
  }
  if (value.length > 4) {
    formattedValue += ") " + value.substring(4, 7);
  }
  if (value.length > 7) {
    formattedValue += "-" + value.substring(7, 11);
  }

  input.value = formattedValue;
}

// Phone number input formatting
const phoneInput = document.getElementById("delivery-phone");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    formatPhoneNumber(this);
  });
}

// Handle form submission
if (deliveryForm) {
  deliveryForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Collect form data
    const formData = {
      name: document.getElementById("delivery-name").value,
      phone: document.getElementById("delivery-phone").value,
      email: document.getElementById("delivery-email").value,
      method: document.getElementById("delivery-method").value,
      address: document.getElementById("delivery-address").value,
      city: document.getElementById("delivery-city").value,
      zip: document.getElementById("delivery-zip").value,
      date: document.getElementById("delivery-date").value,
      time: document.getElementById("delivery-time").value,
      comments: document.getElementById("delivery-comments").value,
    };

    // Validate form
    const errors = validateForm(formData);

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    // Show loading state
    const submitBtn = deliveryForm.querySelector(".submit-btn");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      // Success
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      showToast(
        "Delivery request submitted successfully! We'll contact you shortly.",
        "success",
      );

      // Reset form
      deliveryForm.reset();
      setMinDate();
    }, 2000);
  });
}

// FAQ Accordion functionality
faqQuestions.forEach((question) => {
  question.addEventListener("click", function () {
    const faqItem = this.parentElement;
    const isActive = faqItem.classList.contains("active");

    // Close all FAQ items
    faqQuestions.forEach((q) => {
      q.parentElement.classList.remove("active");
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
      faqItem.classList.add("active");
    }
  });
});

// Smooth scroll to FAQ when clicking on FAQ links
document.querySelectorAll('a[href^="#faq-"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Delivery method change handler
const deliveryMethodSelect = document.getElementById("delivery-method");
const addressFields = [
  document.getElementById("delivery-address"),
  document.getElementById("delivery-city"),
  document.getElementById("delivery-zip"),
];

if (deliveryMethodSelect) {
  deliveryMethodSelect.addEventListener("change", function () {
    const method = this.value;

    // Show/hide address fields based on delivery method
    addressFields.forEach((field) => {
      if (method === "pickup") {
        field.parentElement.style.opacity = "0.5";
        field.disabled = true;
        field.value = "";
      } else {
        field.parentElement.style.opacity = "1";
        field.disabled = false;
      }
    });
  });
}

// Initialize: hide address fields if pickup is selected
if (deliveryMethodSelect && deliveryMethodSelect.value === "pickup") {
  addressFields.forEach((field) => {
    field.parentElement.style.opacity = "0.5";
    field.disabled = true;
  });
}

// Add input validation feedback
const formInputs = deliveryForm.querySelectorAll(
  "input[required], select[required]",
);

formInputs.forEach((input) => {
  input.addEventListener("blur", function () {
    if (this.value.trim() === "") {
      this.style.borderColor = "#f44336";
    } else {
      this.style.borderColor = "#e0e0e0";
    }
  });

  input.addEventListener("input", function () {
    this.style.borderColor = "#e0e0e0";
  });
});

console.log("Delivery page loaded successfully");
