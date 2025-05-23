console.log("Script JS chargé !");

document.addEventListener("DOMContentLoaded", function () {
  // Menu mobile
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
  updateCartCount();
  loadRecuPage();
  setupSearchBar();
  fetchWeather();
});

// -------- MÉTÉO --------
function fetchWeather() {
  const apiKey = '9f26309485957c2bd9641a631b5817c8';
  const city = 'HAITI';
  const units = 'imperial';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;

  // Météo actuelle
  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°F`;
      document.getElementById('weather-description').textContent = data.weather[0].description;
      document.getElementById('high-temp').textContent = `${Math.round(data.main.temp_max)}°F`;
      document.getElementById('low-temp').textContent = `${Math.round(data.main.temp_min)}°F`;
      document.getElementById('humidity').textContent = `${data.main.humidity}%`;
      document.getElementById('sunrise').textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      document.getElementById('sunset').textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      document.getElementById('weather-icon').src = `images/weather.svg`;
      document.getElementById('weather-icon').alt = data.weather[0].description;
    })
    .catch(err => console.error('Erreur météo actuelle :', err));

  // Prévision
  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      const days = [0, 8, 16];
      document.getElementById('day1-temp').textContent = `${Math.round(data.list[days[0]].main.temp)}°F`;
      document.getElementById('day2-temp').textContent = `${Math.round(data.list[days[1]].main.temp)}°F`;
      document.getElementById('day3-temp').textContent = `${Math.round(data.list[days[2]].main.temp)}°F`;
    })
    .catch(err => console.error('Erreur météo prévision :', err));
}

// -------- AJOUT AU PANIER --------
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
        description: button.getAttribute("data-description") || "Pas de description",
        quantity: 1
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(p => p.id === product.id && p.color === product.color);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      alert(`${product.name} (${product.color}) ajouté au panier !`);
    });
  });
}

// -------- AFFICHAGE PANIER --------
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-container");
  if (!container) return;

  container.innerHTML = "";

  cart.forEach(product => {
    const item = document.createElement("div");
    item.className = "cart-item";
    item.setAttribute("data-id", product.id);
    item.setAttribute("data-color", product.color);
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="item-details">
        <h3>${product.name}</h3>
        <p>Couleur : ${product.color}</p>
        <p>Description : ${product.description}</p>
        <p>Quantité : ${product.quantity}</p>
        <p>Prix unitaire : ${product.price.toLocaleString()} $</p>
        <button class="remove-btn">Retirer</button>
      </div>
    `;
    container.appendChild(item);
  });

  setupRemoveButtons();
  updateCartTotal();
}

// -------- SUPPRESSION PRODUIT --------
function setupRemoveButtons() {
  const buttons = document.querySelectorAll('.remove-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.cart-item');
      const id = parseInt(item.getAttribute('data-id'));
      const color = item.getAttribute('data-color');

      if (confirm("Voulez-vous retirer cet article ?")) {
        item.style.opacity = 0;
        setTimeout(() => {
          removeFromCart(id, color);
          item.remove();
          updateCartTotal();
          updateCartCount();
        }, 500);
      }
    });
  });
}

function removeFromCart(id, color) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(p => !(p.id === id && p.color === color));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// -------- TOTAL PANIER --------
function updateCartTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const totalDisplay = document.querySelector(".cart-summary h3");
  if (totalDisplay) totalDisplay.textContent = `Total : ${total.toLocaleString()} $`;

  const totalElement = document.getElementById('cart-total');
  if (totalElement) totalElement.textContent = `${total.toLocaleString()} $`;
}

// -------- CHECKOUT --------
function setupCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const nomClient = document.getElementById("nom-client")?.value.trim();
    const emailClient = document.getElementById("email-client")?.value.trim();

    if (!nomClient || !emailClient) {
      alert("Veuillez entrer votre nom et votre email pour valider la commande.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    localStorage.setItem("nomClient", nomClient);
    localStorage.setItem("totalCommande", total);
    localStorage.setItem("panier", JSON.stringify(cart));

    const emailParams = {
      nom_client: nomClient,
      total_commande: `${total.toLocaleString()} $`,
      produits: cart.map(item =>
        `${item.name} (${item.color}) x${item.quantity} - ${item.price.toLocaleString()} $`
      ).join('\n'),
      email_client: emailClient,
      email_vendeur: "kieftraphterjoly@gmail.com"
    };

    // Remplace les ID ci-dessous avec tes vraies clés EmailJS
    emailjs.send("service_xxx", "template_xxx", emailParams, "Abc123456xyz")
      .then(() => console.log("Email envoyé avec succès !"))
      .catch(error => console.error("Erreur lors de l'envoi de l'email :", error));

    window.location.href = "recu.html";
  });
}

// -------- PAGE REÇU --------
function loadRecuPage() {
  const recuContainer = document.getElementById("recu-details");
  if (!recuContainer) return;

  const nomClient = localStorage.getItem("nomClient") || "Client inconnu";
  const totalCommande = localStorage.getItem("totalCommande") || "0";
  const panier = JSON.parse(localStorage.getItem("panier")) || [];

  const clientInfo = document.createElement("p");
  clientInfo.textContent = `👤 Nom du client : ${nomClient}`;
  recuContainer.appendChild(clientInfo);

  if (panier.length === 0) {
    recuContainer.innerHTML += "<p>Aucun article trouvé dans la commande.</p>";
    return;
  }

  panier.forEach(item => {
    const div = document.createElement("div");
    div.className = "recu-item";
    div.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>Couleur : ${item.color}</p>
      <p>Description : ${item.description}</p>
      <p>Quantité : ${item.quantity}</p>
      <p>Prix unitaire : ${item.price.toLocaleString()} $</p>
    `;
    recuContainer.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "recu-total";
  totalDiv.textContent = `Total : ${parseFloat(totalCommande).toLocaleString()} $`;
  recuContainer.appendChild(totalDiv);
}

// -------- COMPTEUR PANIER --------
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const desktopCount = document.getElementById("cart-count");
  const mobileCount = document.getElementById("cart-count-mobile");

  if (desktopCount) desktopCount.textContent = count;
  if (mobileCount) mobileCount.textContent = count;
}

// -------- BARRE DE RECHERCHE --------
function setupSearchBar() {
  const searchInput = document.querySelector(".search-bar-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
      const name = product.dataset.name.toLowerCase();
      product.style.display = name.includes(query) ? "block" : "none";
    });
  });
}
