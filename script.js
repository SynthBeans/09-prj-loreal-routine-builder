const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateBtn = document.getElementById("generateRoutine");

let allProducts = [];
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];

function saveSelectedToStorage() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

function renderSelectedProducts() {
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product, index) => `
        <div class="selected-product">
          <span>${product.name}</span>
          <button onclick="removeSelectedProduct(${index})">&times;</button>
        </div>
      `
    )
    .join("");
}

function removeSelectedProduct(index) {
  selectedProducts.splice(index, 1);
  saveSelectedToStorage();
  renderSelectedProducts();
  displayProducts(
    allProducts.filter(
      (product) => product.category === categoryFilter.value
    )
  );
}

function isSelected(product) {
  return selectedProducts.some((p) => p.name === product.name);
}

function toggleProductSelection(product) {
  const index = selectedProducts.findIndex((p) => p.name === product.name);
  if (index >= 0) {
    selectedProducts.splice(index, 1);
  } else {
    selectedProducts.push(product);
  }
  saveSelectedToStorage();
  renderSelectedProducts();
}

function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      const selectedClass = isSelected(product) ? "selected" : "";
      return `
        <div class="product-card ${selectedClass}" onclick='toggleAndUpdate(${JSON.stringify(
        product
      )})'>
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <button class="desc-btn" onclick="event.stopPropagation(); toggleDescription(this)">Details</button>
            <div class="product-description">${product.description}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

window.toggleAndUpdate = function (product) {
  toggleProductSelection(product);
  displayProducts(
    allProducts.filter(
      (p) => p.category === categoryFilter.value
    )
  );
};

window.toggleDescription = function (btn) {
  btn.nextElementSibling.classList.toggle("show");
};

categoryFilter.addEventListener("change", async (e) => {
  allProducts = await loadProducts();
  const filtered = allProducts.filter((p) => p.category === e.target.value);
  displayProducts(filtered);
});

async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

generateBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) return;

  chatWindow.innerHTML += `<div class="message user">Generate a routine with my selected products.</div>`;
  chatWindow.innerHTML += `<div class="message bot">Thinking...</div>`;

  const res = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: selectedProducts,
      prompt: "Generate a skincare routine using these products.",
    }),
  });

  const data = await res.json();
  const aiResponse = data.choices?.[0]?.message?.content || "No response.";

  chatWindow.innerHTML = chatWindow.innerHTML.replace("<div class=\"message bot\">Thinking...</div>", `<div class="message bot">${aiResponse}</div>`);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("userInput").value;
  document.getElementById("userInput").value = "";
  chatWindow.innerHTML += `<div class="message user">${userInput}</div>`;

  const res = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      products: selectedProducts,
      prompt: userInput,
    }),
  });

  const data = await res.json();
  const aiResponse = data.choices?.[0]?.message?.content || "No response.";
  chatWindow.innerHTML += `<div class="message bot">${aiResponse}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Initial rendering
renderSelectedProducts();
