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
    const itemPrice = selectedItem.querySelector(".card-price")?.textContent || "";
    const itemImage = selectedItem.querySelector(".card-img img")?.src || "";
    
    const cartItem = {
      name: itemName,
      price: itemPrice,
      image: itemImage,
      quantity: 1
    };
    
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.name === itemName);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push(cartItem);
    }
    
    updateCart();
  });
});

// Update cart UI
function updateCart() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const emptyCartMessage = cartItemsContainer.querySelector(".empty-cart-message");
  const totalAmountElement = document.querySelector(".total-amount");
  const cartLabel = document.querySelector(".cart-label");
  
  // Clear current items (except empty message)
  cartItemsContainer.innerHTML = "";
  
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
    totalAmountElement.textContent = "$0.00";
    cartLabel.textContent = "Empty";
    return;
  }
  
  // Add items to cart
  let total = 0;
  cartItems.forEach((item, index) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";
    
    // Extract numeric price
    const priceMatch = item.price.match(/\d+/);
    const itemPrice = priceMatch ? parseInt(priceMatch[0]) : 0;
    const itemTotal = itemPrice * item.quantity;
    total += itemTotal;
    
    cartItemElement.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        <div style="flex: 1; margin-left: 10px;">
          <h4 style="margin: 0; font-size: 14px;">${item.name}</h4>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${item.price}</p>
        </div>
      </div>
      <div class="cart-item-controls" style="display: flex; align-items: center; gap: 10px;">
        <button class="decrease-qty" data-index="${index}" style="padding: 2px 8px; cursor: pointer;">-</button>
        <span style="font-size: 14px;">${item.quantity}</span>
        <button class="increase-qty" data-index="${index}" style="padding: 2px 8px; cursor: pointer;">+</button>
        <button class="remove-item" data-index="${index}" style="padding: 2px 8px; cursor: pointer; color: red;">×</button>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItemElement);
  });
  
  // Update total and label
  totalAmountElement.textContent = `₽${total}`;
  cartLabel.textContent = `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`;
  
  // Add event listeners for quantity controls
  document.querySelectorAll(".increase-qty").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      cartItems[index].quantity++;
      updateCart();
    });
  });
  
  document.querySelectorAll(".decrease-qty").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (cartItems[index].quantity > 1) {
        cartItems[index].quantity--;
      } else {
        cartItems.splice(index, 1);
      }
      updateCart();
    });
  });
  
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      cartItems.splice(index, 1);
      updateCart();
    });
  });
}
