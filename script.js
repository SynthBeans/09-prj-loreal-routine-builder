// DOM Elements
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");

// To store selected products
let selectedProducts = [];

// Load the product data from JSON
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

// Display the products in the grid
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
        <p class="category">${product.category}</p>
      </div>
    </div>`
    )
    .join("");
}

// Filter products by category
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  // Filter products based on selected category
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  // Display filtered products
  displayProducts(filteredProducts);
});

// Allow product selection and display the selected items
productsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".product-card")) {
    const productCard = e.target.closest(".product-card");
    const productId = productCard.dataset.id;
    const productName = productCard.querySelector("h3").textContent;
    const productBrand = productCard.querySelector("p").textContent;

    // Check if product is already selected
    const isSelected = selectedProducts.some(
      (product) => product.id === productId
    );

    if (isSelected) {
      // Remove product from the selection if already selected
      selectedProducts = selectedProducts.filter(
        (product) => product.id !== productId
      );
      productCard.classList.remove("selected");
    } else {
      // Add product to the selected list
      selectedProducts.push({ id: productId, name: productName, brand: productBrand });
      productCard.classList.add("selected");
    }

    // Update the "Selected Products" section
    updateSelectedProducts();
  }
});

// Update the "Selected Products" section
function updateSelectedProducts() {
  const selectedProductsList = document.getElementById("selectedProductsList");

  // Clear the list
  selectedProductsList.innerHTML = "";

  // Populate the list with selected products
  selectedProducts.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("selected-product-item");
    productItem.textContent = product.name;

    // Add a "remove" button for each selected product
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      selectedProducts = selectedProducts.filter(
        (selectedProduct) => selectedProduct.id !== product.id
      );
      updateSelectedProducts();
      const productCard = document.querySelector(`.product-card[data-id="${product.id}"]`);
      if (productCard) productCard.classList.remove("selected");
    });

    productItem.appendChild(removeButton);
    selectedProductsList.appendChild(productItem);
  });
}

// Generate routine (this part assumes you have an API call function that generates the routine)
document.getElementById("generateRoutine").addEventListener("click", async () => {
  console.log("Selected products:", selectedProducts);  // Debugging line

  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = "Please select some products first.";
    return;
  }

  // Log the data being sent to the Worker
  console.log("Sending selected products to Worker:", selectedProducts);

  // Sending data to the Cloudflare Worker
  const response = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: selectedProducts,  // Ensure products are properly sent
    }),
  });

  // Log the raw response from the Worker
  const textResponse = await response.text();
  console.log("Raw response from Worker:", textResponse);  // Log the raw response

  // If no valid response, show a message
  if (!textResponse || textResponse.trim() === "") {
    chatWindow.innerHTML = "No response from the API.";
    return;
  }

  // Parse the response as JSON
  const result = JSON.parse(textResponse);
  console.log("Parsed response:", result);

  // Check if the result contains the expected data
  if (result && result.choices) {
    chatWindow.innerHTML = result.choices[0].message.content;
  } else {
    chatWindow.innerHTML = "No valid response from the API.";
  }
});

// Handle chat form submission (this sends user input to the worker)
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInputText = document.getElementById("userInput").value;

  const response = await fetch("https://workerthingyhelpme.xxsynth.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: userInputText,
    }),
  });

  const result = await response.json();
  if (result && result.choices) {
    chatWindow.innerHTML += `<p>${result.choices[0].message.content}</p>`;
  } else {
    chatWindow.innerHTML += "<p>No valid response from the API.</p>";
  }

  document.getElementById("userInput").value = "";
});
