const $pizzasWrapper = document.querySelector(".pizzas-wrapper");
const $cartWrapper = document.querySelector(".basket-aside");
const $modal = document.querySelector(".order-modal-wrapper");

let cart = {};
let products = [];

function addToCart(productId, card) {
  cart[productId] = 1;
  card.classList.add("pizza-item--active");
  card.querySelector(".edit-cart-count").textContent = cart[productId];
  displayCart(cart);
}

function removeFromCart(productId) {
  delete cart[productId];
  displayCart(cart);
  $pizzasWrapper.querySelectorAll(".pizza-item--active").forEach((card) => {
    if (card.dataset.id === productId)
      card.classList.remove("pizza-item--active");
  });
}

function editCart(productId, quantity, card) {
  cart[productId] += quantity;

  if (cart[productId] <= 0) {
    card.classList.remove("pizza-item--active");
    delete cart[productId];
  }
  card.querySelector(".edit-cart-count").textContent = cart[productId];

  displayCart(cart);
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("pizza-item");
  card.dataset.id = product.id;

  const mainPicture = document.createElement("img");
  mainPicture.classList.add("pizza-picture");
  mainPicture.src = product.image;

  card.appendChild(mainPicture);

  const addToCartBtn = document.createElement("span");
  addToCartBtn.classList.add("add-to-cart-btn");

  const addToCartBtnImg = document.createElement("img");
  addToCartBtnImg.src = "../images/carbon_shopping-cart-plus.svg";

  addToCartBtn.appendChild(addToCartBtnImg);
  addToCartBtn.innerHTML += " Ajouter au panier ";

  card.appendChild(addToCartBtn);

  const editCartWrapper = document.createElement("span");
  editCartWrapper.classList.add("edit-cart-buttons-wrapper");

  const editCartSubtractButton = document.createElement("img");
  editCartSubtractButton.classList.add("subtract-btn");
  editCartSubtractButton.src = "../images/Subtract Icon.svg";

  editCartWrapper.appendChild(editCartSubtractButton);

  const editCartButtonCount = document.createElement("span");
  editCartButtonCount.classList.add("edit-cart-count");
  editCartButtonCount.textContent = "0";

  editCartWrapper.appendChild(editCartButtonCount);

  const editCartAddButton = document.createElement("img");
  editCartAddButton.classList.add("add-btn");
  editCartAddButton.src = "../images/Add Icon.svg";

  editCartWrapper.appendChild(editCartAddButton);

  card.appendChild(editCartWrapper);

  const pizzaInfos = document.createElement("ul");
  pizzaInfos.classList.add("pizza-infos");

  const pizzaName = document.createElement("li");
  pizzaName.classList.add("pizza-name");
  pizzaName.textContent = product.name;

  const pizzaPrice = document.createElement("li");
  pizzaPrice.classList.add("pizza-price");
  pizzaPrice.textContent = "$" + product.price.toFixed(2);

  pizzaInfos.appendChild(pizzaName);
  pizzaInfos.appendChild(pizzaPrice);

  card.appendChild(pizzaInfos);

  return card;
}

function displayProducts(products) {
  $pizzasWrapper.innerHTML = "";

  products.forEach((product) => {
    const productCard = createProductCard(product);

    productCard
      .querySelector(".add-to-cart-btn")
      .addEventListener("click", () => addToCart(product.id, productCard));

    productCard
      .querySelector(".subtract-btn")
      .addEventListener("click", () => editCart(product.id, -1, productCard));

    productCard
      .querySelector(".add-btn")
      .addEventListener("click", () => editCart(product.id, 1, productCard));

    $pizzasWrapper.appendChild(productCard);
  });
}

function createCartItem(item) {
  const { product, count } = item;

  const $item = document.createElement("li");
  $item.classList.add("basket-product-item");

  const $itemName = document.createElement("span");
  $itemName.classList.add("basket-product-item-name");
  $itemName.textContent = product.name;
  $item.appendChild($itemName);

  const $itemDetails = document.createElement("span");
  $itemDetails.classList.add("basket-product-details");

  const $itemQuantity = document.createElement("span");
  $itemQuantity.classList.add("basket-product-details-quantity");
  $itemQuantity.textContent = count;

  $itemDetails.appendChild($itemQuantity);

  const $itemUnitPrice = document.createElement("span");
  $itemUnitPrice.classList.add("basket-product-details-unit-price");
  $itemUnitPrice.textContent = "$" + product.price.toFixed(2);

  $itemDetails.appendChild($itemUnitPrice);

  const $itemTotalPrice = document.createElement("span");
  $itemTotalPrice.classList.add("basket-product-details-total-price");
  $itemTotalPrice.textContent = "$" + (product.price * count).toFixed(2);

  $itemDetails.appendChild($itemTotalPrice);

  $item.appendChild($itemDetails);

  const $itemRemove = document.createElement("img");
  $itemRemove.classList.add("basket-product-remove-icon");
  $itemRemove.src = "../images/remove-icon.svg";
  $itemRemove.onclick = () => removeFromCart(product.id);

  $item.appendChild($itemRemove);

  return $item;
}

function displayCart(cart) {
  if (Object.keys(cart).length === 0) {
    $cartWrapper.innerHTML = `<h2>Votre panier (0)</h2><div class="empty-basket"><img src="../images/pizza.png" alt="" /><p>Votre panier est vide...</p></div>`;
    return;
  }

  const cartProducts = Object.keys(cart).map((productId) => {
    const product = products.filter((product) => product.id === productId)[0];
    return { product, count: cart[productId] };
  });

  const $cartTitle = document.createElement("h2");
  $cartTitle.textContent = `Votre panier (${cartProducts.reduce(
    (a, b) => a + b.count,
    0
  )})`;

  $cartWrapper.innerHTML = "";

  $cartWrapper.appendChild($cartTitle);

  const $cartItemsWrapper = document.createElement("div");
  $cartItemsWrapper.classList.add("baskets-with-pizza");

  const $cartItems = document.createElement("ul");
  $cartItems.classList.add("basket-products");

  cartProducts.forEach((cartProduct) => {
    const $item = createCartItem(cartProduct);
    $cartItems.appendChild($item);
  });

  $cartItemsWrapper.appendChild($cartItems);

  const $cartTotal = document.createElement("p");
  $cartTotal.classList.add("total-order");

  const $cartTotalTitle = document.createElement("span");
  $cartTotalTitle.classList.add("total-order-title");
  $cartTotalTitle.textContent = "Order total";

  $cartTotal.appendChild($cartTotalTitle);

  const $cartTotalPrice = document.createElement("span");
  $cartTotalPrice.classList.add("total-order-price");
  $cartTotalPrice.textContent =
    "$" +
    cartProducts.reduce((a, b) => a + b.count * b.product.price, 0).toFixed(2);

  $cartTotal.appendChild($cartTotalPrice);

  const $cartDelivery = document.createElement("p");
  $cartDelivery.classList.add("delivery-info");
  $cartDelivery.innerHTML = `This is a <span>carbon neutral</span> delivery`;

  $cartItemsWrapper.appendChild($cartTotal);

  $cartItemsWrapper.appendChild($cartDelivery);

  const $cartButton = document.createElement("a");
  $cartButton.classList.add("confirm-order-btn");
  $cartButton.textContent = "Confirm order";
  $cartButton.onclick = async () => {
    const res = await fetch("http://10.59.122.41:3000/orders/", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: Object.keys(cart).map((productId) => {
          return { uuid: productId, quantity: cart[productId] };
        }),
      }),
    });
    const data = await res.json();
    console.log(data);
    displayModal(cart);
  };

  $cartItemsWrapper.appendChild($cartButton);

  $cartWrapper.appendChild($cartItemsWrapper);
}

async function getProducts() {
  const res = await fetch("http://10.59.122.41:3000/products");
  const data = await res.json();
  return data;
}

function displayModal(cart) {
  $modal.classList.remove("hidden");
}

async function main() {
  products = await getProducts();

  console.log(products);

  displayProducts(products);
}

localStorage.setItem(
  "token",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEubGF2aWduZUBlZGVuc2Nob29sLmZyIiwic3ViIjoiNTFjNmMyZDEtMGY4OC00Mzk2LWJmNzktNjkyNjI2ZTYwNDg4IiwiaWF0IjoxNzQ0MDM3MTUzLCJleHAiOjE3NDQxMjM1NTN9.LbeUQeeGmrwaKx9dCxZsMZDN7dfv_cmdvAhkUjRdYP0"
);

main();
