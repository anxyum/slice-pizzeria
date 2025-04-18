const $pizzasWrapper = document.querySelector(".pizzas-wrapper");
const $cartWrapper = document.querySelector(".basket-aside");
const $modal = document.querySelector(".order-modal-wrapper");

const apiPath = "https://prime-garfish-currently.ngrok-free.app";

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

  const $cartButton = document.createElement("button");
  $cartButton.classList.add("confirm-order-btn");
  $cartButton.textContent = "Confirm order";
  $cartButton.onclick = async () => {
    $cartButton.disabled = true;
    const res = await fetch(`${apiPath}/orders/`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "1",
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
    displayModal(data);
  };

  $cartItemsWrapper.appendChild($cartButton);

  $cartWrapper.appendChild($cartItemsWrapper);
}

async function getProducts() {
  const res = await fetch(`${apiPath}/products`, {
    headers: {
      "ngrok-skip-browser-warning": "1",
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
}

function createReportItem(item) {
  const $reportItem = document.createElement("li");
  $reportItem.classList.add("order-detail-product-item");

  const $itemImg = document.createElement("img");
  $itemImg.classList.add("order-detail-product-image");
  $itemImg.src = item.product.image;

  $reportItem.appendChild($itemImg);

  const $itemName = document.createElement("span");
  $itemName.classList.add("order-detail-product-name");
  $itemName.textContent = item.product.name;

  $reportItem.appendChild($itemName);

  const $itemQuantity = document.createElement("span");
  $itemQuantity.classList.add("order-detail-product-quantity");
  $itemQuantity.textContent = item.quantity + "x";

  $reportItem.appendChild($itemQuantity);

  const $itemUnitPrice = document.createElement("span");
  $itemUnitPrice.classList.add("order-detail-product-unit-price");
  $itemUnitPrice.textContent = "@ $" + item.product.price.toFixed(2);

  $reportItem.appendChild($itemUnitPrice);

  const $itemTotalPrice = document.createElement("span");
  $itemTotalPrice.classList.add("order-detail-product-total-price");
  $itemTotalPrice.textContent =
    "$" + (item.quantity * item.product.price).toFixed(2);

  $reportItem.appendChild($itemTotalPrice);

  return $reportItem;
}

function displayModal(order) {
  const $reportItemList = $modal.querySelector(".order-detail");
  $reportItemList.innerHTML = "";

  order.products.forEach((item) => {
    $reportItemList.appendChild(createReportItem(item));
  });

  $reportItemList.innerHTML += `
          <li class="order-detail-total-price">
            <span class="total-order-title">Order total</span>
            <span class="total-order-price">$${order.products
              .reduce((a, b) => a + b.product.price * b.quantity, 0)
              .toFixed(2)}</span>
          </li>`;

  $modal.classList.remove("hidden");
}

async function main() {
  products = await getProducts();

  console.log(products);

  displayProducts(products);
}

localStorage.setItem(
  "token",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEubGF2aWduZUBlZGVuc2Nob29sLmZyIiwic3ViIjoiNTFjNmMyZDEtMGY4OC00Mzk2LWJmNzktNjkyNjI2ZTYwNDg4IiwiaWF0IjoxNzQ0Mjg1NTk0LCJleHAiOjE3NDQzNzE5OTR9.xVUN4TRvU28a51CT7q9Gjs_J8Kw-3oTq7moMD1Z0fKI"
);

main();

$modal.querySelector(".new-order-btn").addEventListener("click", () => {
  $modal.classList.add("hidden");
  cart = {};
  displayProducts(products);
  displayCart(cart);
});
