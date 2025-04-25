console.log("Script JS chargé !");

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });
  }

  setupAddToCartButtons();
  loadCartItems();
  setupCheckoutButton();
});

// --------- MÉTÉO ---------
const apiKey = '9f26309485957c2bd9641a631b5817c8';
const city = 'HAITI'; 
const units = 'imperial'; 
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;

// Fetch Current Weather
fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
        document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°F`;
        document.getElementById('weather-description').textContent = data.weather[0].description;
        document.getElementById('high-temp').textContent = `${Math.round(data.main.temp_max)}°F`;
        document.getElementById('low-temp').textContent = `${Math.round(data.main.temp_min)}°F`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;

        // Convert UNIX timestamp to readable time for sunrise and sunset
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById('sunrise').textContent = sunrise;
        document.getElementById('sunset').textContent = sunset;

        // Weather Icon
        const iconCode = data.weather[0].icon;
        document.getElementById('weather-icon').src = `images/weather.svg`;
        document.getElementById('weather-icon').alt = data.weather[0].description;
    })
    .catch(error => console.error('Error fetching current weather:', error));


fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
        
        const forecastDays = [0, 8, 16]; 

        document.getElementById('day1-temp').textContent = `${Math.round(data.list[forecastDays[0]].main.temp)}°F`;
        document.getElementById('day2-temp').textContent = `${Math.round(data.list[forecastDays[1]].main.temp)}°F`;
        document.getElementById('day3-temp').textContent = `${Math.round(data.list[forecastDays[2]].main.temp)}°F`;
    })
    .catch(error => console.error('Error fetching forecast data:', error));

// --------- AJOUTER AU PANIER (AVEC COULEUR) -----------
function setupAddToCartButtons() {
  const addButtons = document.querySelectorAll(".add-to-cart");

  addButtons.forEach(button => {
    button.addEventListener("click", () => {
      const parentCard = button.closest(".product-card");
      const select = parentCard.querySelector(".color-select");
      const selectedColor = select ? select.value : "Non spécifiée";

      const product = {
        id: parseInt(button.getAttribute("data-id")),
        name: button.getAttribute("data-name"),
        price: parseFloat(button.getAttribute("data-price")),
        image: button.getAttribute("data-image"),
        color: selectedColor,
        quantity: 1
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(item => item.id === product.id && item.color === product.color);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.name} (${product.color}) a été ajouté au panier !`);
    });
  });
}

// --------- AFFICHER LE PANIER -----------
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-container");
  if (!container) return;

  container.innerHTML = "";

  cart.forEach(product => {
    const item = document.createElement("div");
    item.className = "cart-item";
    item.setAttribute("data-id", product.id);
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="item-details">
        <h3>${product.name}</h3>
        <p>Couleur : ${product.color}</p>
        <p>Quantité : ${product.quantity}</p>
        <p>Prix unitaire : ${product.price.toLocaleString()} €</p>
        <button class="remove-btn">Retirer</button>
      </div>
    `;
    container.appendChild(item);
  });

  setupRemoveButtons();
  updateCartTotal();
}

// --------- SUPPRIMER PRODUIT -----------
function setupRemoveButtons() {
  const buttons = document.querySelectorAll('.remove-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.cart-item');
      const id = parseInt(item.getAttribute('data-id'));
      const color = item.querySelector("p:nth-child(2)").textContent.split(": ")[1];

      if (confirm("Voulez-vous vraiment retirer cet article du panier ?")) {
        item.style.opacity = 0;
        setTimeout(() => {
          removeFromCart(id, color);
          item.remove();
          updateCartTotal();
        }, 500);
      }
    });
  });
}

function removeFromCart(id, color) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(product => !(product.id === id && product.color === color));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// --------- TOTAL -----------
function updateCartTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  const totalDisplay = document.querySelector(".cart-summary h3");
  if (totalDisplay) totalDisplay.textContent = `Total : ${total.toLocaleString()} €`;
}

// --------- CHECKOUT -----------
function setupCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    alert("Merci pour votre commande ! (Simulation)");
    localStorage.removeItem("cart");
    loadCartItems();
    updateCartTotal();
  });
}
