const cardCart = document.querySelectorAll(".card-cart");

let cartItems = [];
let index = 0;
let slides;
let totalSlides;

// Hero slider functions
function updateSlider() {
  slides.style.transform = `translateX(-${index * 100}%)`;
}

function next() {
  index = (index + 1) % totalSlides;
  updateSlider();
}

function prev() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlider();
}

// Catalog carousel variables and functions
let catalogIndex = 0;
let catalogCards;
let totalCatalogCards;
let visibleCards = 4; // Default for desktop

function getVisibleCards() {
  // Determine number of visible cards based on screen width
  if (window.innerWidth <= 600) {
    return 1;
  } else if (window.innerWidth <= 900) {
    return 2;
  } else if (window.innerWidth <= 1200) {
    return 3;
  } else {
    return 4;
  }
}

function updateCatalog() {
  visibleCards = getVisibleCards();
  const slidePercentage = 100 / visibleCards;

  // Add smooth animation with easing
  catalogCards.style.transform = `translateX(-${
    catalogIndex * slidePercentage
  }%)`;

  // Update active state for buttons
  document.getElementById("catalog-prev").disabled = catalogIndex === 0;
  document.getElementById("catalog-next").disabled =
    catalogIndex >= totalCatalogCards - visibleCards;

  // Add visual feedback
  document.getElementById("catalog-prev").style.opacity =
    catalogIndex === 0 ? "0.5" : "1";
  document.getElementById("catalog-next").style.opacity =
    catalogIndex >= totalCatalogCards - visibleCards ? "0.5" : "1";
}

function nextCatalog() {
  if (catalogIndex < totalCatalogCards - visibleCards) {
    catalogIndex++;
    updateCatalog();
  }
}

function prevCatalog() {
  if (catalogIndex > 0) {
    catalogIndex--;
    updateCatalog();
  }
}

// Handle window resize
window.addEventListener("resize", updateCatalog);

document.addEventListener("DOMContentLoaded", () => {
  // Initialize hero slider
  slides = document.querySelector(".slides");
  totalSlides = document.querySelectorAll(".slide").length;
  updateSlider();

  // Initialize catalog carousel
  catalogCards = document.querySelector("#catalog .cards");
  totalCatalogCards = document.querySelectorAll("#catalog .card").length;
  visibleCards = getVisibleCards();
  updateCatalog(); // Initialize button states

  // Add event listeners for catalog navigation
  const prevButton = document.getElementById("catalog-prev");
  const nextButton = document.getElementById("catalog-next");

  if (prevButton) {
    prevButton.addEventListener("click", prevCatalog);
  }

  if (nextButton) {
    nextButton.addEventListener("click", nextCatalog);
  }
});

// clicking cart and adding to cart
cardCart.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedItem = e.target.closest(".card");
    const itemName = selectedItem.querySelector("h3")?.textContent || "";
    cartItems.push(itemName);

    console.log(cartItems);
  
  });
});
