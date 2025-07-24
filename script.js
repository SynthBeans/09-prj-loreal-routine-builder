// Updated script.js with chat fixes

const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

let allProducts = [];
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];

function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

function renderSelectedProducts() {
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (p, i) => `
        <div class="selected-item">
          ${p.name} <button onclick="removeSelected(${i})">&times;</button>
        </div>
      `
    )
    .join("");
}

function removeSelected(index) {
  selectedProducts.splice(index, 1);
  saveSelectedProducts();
  renderSelectedProducts();
  highlightSelected();
}

function highlightSelected() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const productName = card.dataset.name;
    const isSelected = selectedProducts.find((p) => p.name === productName);
    card.classList.toggle("selected", isSelected);
  });
}

async function loadProducts() {
  const res = await fetch("products.json");
  const data = await res.json();
  allProducts = data.products;
}

function displayProducts(category) {
  const filtered = allProducts.filter((p) => p.category === category);
  productsContainer.innerHTML = filtered
    .map(
      (product) => `
      <div class="product-card" data-name="${product.name}">
        <img src="${product.image}" alt="${product.name}" />
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".product-card").forEach((card) => {
    const name = card.dataset.name;
    const product = filtered.find((p) => p.name === name);

    card.addEventListener("click", () => {
      const index = selectedProducts.findIndex((p) => p.name === name);
      if (index === -1) {
        selectedProducts.push(product);
      } else {
        selectedProducts.splice(index, 1);
      }
      saveSelectedProducts();
      renderSelectedProducts();
      highlightSelected();
    });
  });

  highlightSelected();
}

categoryFilter.addEventListener("change", (e) => {
  displayProducts(e.target.value);
});

// Generate routine button
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML += `<div class="chat-message error">⚠️ Please select some products first.</div>`;
    return;
  }

  chatWindow.innerHTML += `<div class="chat-message user"><strong>You:</strong> Generate a routine with selected products.</div>`;

  const res = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: selectedProducts })
  });

  const data = await res.json();

  if (data && data.choices && data.choices[0]) {
    chatWindow.innerHTML += `<div class="chat-message bot"><strong>Bot:</strong> ${data.choices[0].message.content}</div>`;
  } else {
    chatWindow.innerHTML += `<div class="chat-message error">⚠️ No valid response from the API.</div>`;
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Chat input handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  chatWindow.innerHTML += `<div class="chat-message user"><strong>You:</strong> ${userText}</div>`;
  input.value = "";

  const res = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userText })
  });

  const data = await res.json();

  if (data && data.choices && data.choices[0]) {
    chatWindow.innerHTML += `<div class="chat-message bot"><strong>Bot:</strong> ${data.choices[0].message.content}</div>`;
  } else {
    chatWindow.innerHTML += `<div class="chat-message error">⚠️ No valid response from the API.</div>`;
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Initial load
(async () => {
  await loadProducts();
  renderSelectedProducts();
})();
