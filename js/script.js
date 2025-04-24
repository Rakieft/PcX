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

// --------- AJOUTER AU PANIER -----------
function setupAddToCartButtons() {
  const addButtons = document.querySelectorAll(".add-to-cart");

  addButtons.forEach(button => {
    button.addEventListener("click", () => {
      const product = {
        id: parseInt(button.getAttribute("data-id")),
        name: button.getAttribute("data-name"),
        price: parseFloat(button.getAttribute("data-price")),
        image: button.getAttribute("data-image"),
        quantity: 1
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.name} a été ajouté au panier !`);
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
      if (confirm("Voulez-vous vraiment retirer cet article du panier ?")) {
        item.style.opacity = 0;
        setTimeout(() => {
          removeFromCart(id);
          item.remove();
          updateCartTotal();
        }, 500);
      }
    });
  });
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(product => product.id !== id);
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
