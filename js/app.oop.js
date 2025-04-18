const $pizzasWrapper = document.querySelector(".pizzas-wrapper");
const $modal = document.querySelector(".order-modal-wrapper");

const $emptyCart = document.querySelector(".empty-basket");

const $cartWrapper = document.querySelector(".baskets-with-pizza");
const $cartItemsWrapper = document.querySelector(".basket-products");
const $cartOrderBtn = document.querySelector(".confirm-order-btn");
const $cartItemsCount = document.querySelector(".basket-items-count");
const $cartTotalPrice = document.querySelector(".total-order-price");

class Api {
  constructor(url) {
    this.url = url;
    this.token = localStorage.getItem("token") || null;
  }

  async connect(email, password) {
    const token = await this.post("auth/login/", { email, password });
    localStorage.setItem("token", token);
    this.token = token;
  }

  decodeJson(body) {
    return body.json();
  }

  parseToJSON(body) {
    return JSON.stringify(body);
  }

  async get(route, hasToken) {
    let params;
    if (hasToken) {
      params = [
        `${this.url}/${route}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
            Authorization: "Bearer " + this.token,
          },
        },
      ];
    } else {
      params = [
        `${this.url}/${route}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        },
      ];
    }

    const res = await fetch(...params);
    return this.decodeJson(res);
  }

  async post(route, body, hasToken) {
    let params;
    if (hasToken) {
      params = [
        `${this.url}/${route}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "1",
            Authorization: "Bearer " + this.token,
          },
          body: this.parseToJSON(body),
        },
      ];
    } else {
      params = [
        `${this.url}/${route}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "1",
          },
          body: this.parseToJSON(body),
        },
      ];
    }

    const res = await fetch(...params);
    return this.decodeJson(res);
  }
}

class Product {
  constructor({ id, name, description, price, image }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;

    this.card = new ProductCard(this);
  }
}

class ProductCard {
  constructor(product) {
    this.product = product;
    [this.$element, this.$cardButtons] = this.createCard();
  }

  updateQuantity(quantity) {
    this.$element.querySelector(".edit-cart-count").textContent = quantity;
  }

  createCard() {
    const $card = document.createElement("div");
    $card.classList.add("pizza-item");
    $card.dataset.id = this.product.id;

    const $mainPicture = document.createElement("img");
    $mainPicture.classList.add("pizza-picture");
    $mainPicture.src = this.product.image;

    $card.appendChild($mainPicture);

    const $addToCartBtn = document.createElement("span");
    $addToCartBtn.classList.add("add-to-cart-btn");

    const $addToCartBtnImg = document.createElement("img");
    $addToCartBtnImg.src = "../images/carbon_shopping-cart-plus.svg";

    $addToCartBtn.appendChild($addToCartBtnImg);
    $addToCartBtn.innerHTML += " Ajouter au panier ";

    $card.appendChild($addToCartBtn);

    const $editCartWrapper = document.createElement("span");
    $editCartWrapper.classList.add("edit-cart-buttons-wrapper");

    const $editCartSubtractButton = document.createElement("img");
    $editCartSubtractButton.classList.add("subtract-btn");
    $editCartSubtractButton.src = "../images/Subtract Icon.svg";

    $editCartWrapper.appendChild($editCartSubtractButton);

    const $editCartButtonCount = document.createElement("span");
    $editCartButtonCount.classList.add("edit-cart-count");
    $editCartButtonCount.textContent = "1";

    $editCartWrapper.appendChild($editCartButtonCount);

    const $editCartAddButton = document.createElement("img");
    $editCartAddButton.classList.add("add-btn");
    $editCartAddButton.src = "../images/Add Icon.svg";

    $editCartWrapper.appendChild($editCartAddButton);

    $card.appendChild($editCartWrapper);

    const $pizzaInfos = document.createElement("ul");
    $pizzaInfos.classList.add("pizza-infos");

    const $pizzaName = document.createElement("li");
    $pizzaName.classList.add("pizza-name");
    $pizzaName.textContent = this.product.name;

    const $pizzaPrice = document.createElement("li");
    $pizzaPrice.classList.add("pizza-price");
    $pizzaPrice.textContent = "$" + this.product.price.toFixed(2);

    $pizzaInfos.appendChild($pizzaName);
    $pizzaInfos.appendChild($pizzaPrice);

    $card.appendChild($pizzaInfos);

    return [
      $card,
      {
        $addToCartBtn,
        $editCartWrapper,
        $editCartSubtractButton,
        $editCartAddButton,
      },
    ];
  }

  toggle() {
    this.$element.classList.toggle("pizza-item--active");
  }
}

class CartItem {
  constructor(product) {
    this.quantity = 1;
    this.totalPrice = product.price;
    this.product = product;
    this.card = new CartItemCard(this);
    this.onUpdate = [];

    const $productCardButtons = this.product.card.$cardButtons;
    this.$increaseButton = $productCardButtons.$editCartAddButton;
    this.$decreaseButton = $productCardButtons.$editCartSubtractButton;
    this.$addToCartBtn = $productCardButtons.$addToCartBtn;

    this.$increaseButton.addEventListener("click", () => this.increase());
    this.$decreaseButton.addEventListener("click", () => this.decrease());
    this.$addToCartBtn.addEventListener("click", () => this.addToCart());

    const $itemCardElements = this.card.$cardElements;
    this.$removeBtn = $itemCardElements.$removeBtn;

    this.$removeBtn.addEventListener("click", () => {
      this.removeItem();
    });
  }

  calculateTotalPrice() {
    this.totalPrice = this.quantity * this.product.price;
  }

  removeItem() {
    this.quantity = 0;
    this.product.card.toggle();
    this.card.toggle();
  }

  addToCart() {
    this.quantity = 1;
    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();
    this.product.card.toggle();
    this.card.updateQuantity(this.quantity);
    this.card.toggle();

    this.triggerOnUpdate();
  }

  increase() {
    this.quantity++;
    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();
    this.card.updateQuantity(this.quantity);

    this.triggerOnUpdate();
  }

  decrease() {
    this.quantity--;
    this.card.updateQuantity(this.quantity);
    if (this.quantity <= 0) {
      this.removeItem();
    }

    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();

    this.triggerOnUpdate();
  }

  triggerOnUpdate() {
    this.onUpdate.forEach((f) => f(this));
  }
}

class CartItemCard {
  constructor(item) {
    this.item = item;
    [this.$element, this.$cardElements] = this.createCard();
  }

  createCard() {
    const $card = document.createElement("li");
    $card.classList.add("basket-product-item");

    const $productName = document.createElement("span");
    $productName.classList.add("basket-product-item-name");
    $productName.textContent = this.item.product.name;

    $card.appendChild($productName);

    const $productDetails = document.createElement("span");
    $productDetails.classList.add("basket-product-details");

    const $quantityWrapper = document.createElement("span");
    $quantityWrapper.classList.add("basket-product-details-quantity");

    const $quantity = document.createElement("span");
    $quantity.textContent = this.item.quantity;

    $quantityWrapper.appendChild($quantity);
    $quantityWrapper.appendChild(document.createTextNode("x"));

    $productDetails.appendChild($quantityWrapper);

    const $unitPrice = document.createElement("span");
    $unitPrice.classList.add("basket-product-details-unit-price");
    $unitPrice.textContent = "@ $" + this.item.product.price.toFixed(2);

    $productDetails.appendChild($unitPrice);

    const $totalPriceWrapper = document.createElement("span");
    $totalPriceWrapper.classList.add("basket-product-total-price");

    const $totalPrice = document.createElement("span");
    $totalPrice.textContent = this.item.totalPrice.toFixed(2);

    $totalPriceWrapper.appendChild(document.createTextNode("$"));
    $totalPriceWrapper.appendChild($totalPrice);

    $productDetails.appendChild($totalPriceWrapper);

    $card.appendChild($productDetails);

    const $removeBtn = document.createElement("img");
    $removeBtn.classList.add("basket-product-remove-icon");
    $removeBtn.src = "../images/remove-icon.svg";

    $card.appendChild($removeBtn);

    return [
      $card,
      {
        $quantity,
        $totalPrice,
        $removeBtn,
      },
    ];
  }

  updateQuantity(quantity) {
    this.$cardElements.$quantity.textContent = quantity;
    this.$cardElements.$totalPrice.textContent = (
      quantity * this.item.product.price
    ).toFixed(2);
  }

  toggle() {
    this.$element.classList.toggle("hidden");
    const $parent = this.$element.parentElement;
    $parent.removeChild(this.$element);
    $parent.appendChild(this.$element);
  }
}

class Cart {
  constructor($mainWrapper, $emptyCart, $elements) {
    this.items = [];
    this.$mainWrapper = $mainWrapper;
    this.$emptyCart = $emptyCart;
    this.$elements = $elements;
  }

  updateTotal() {
    console.log("saucisson");

    this.$elements.$totalPrice.textContent = this.items.reduce(
      (a, b) => a + b.totalPrice,
      0
    );
    this.$elements.$itemsCount.textContent = this.items.reduce(
      (a, b) => a + b.quantity,
      0
    );
  }

  addItem(item) {
    console.log(item);
    this.items.push(item);
    this.$mainWrapper.appendChild(item.card.$element);
    item.onUpdate.push(() => {
      this.$elements;
    });
  }

  countItems() {
    return this.items.reduce((a, b) => a + b.quantity, 0);
  }

  async order() {
    const products = this.items
      .filter((item) => item.quantity > 0)
      .map((item) => {
        return { quantity: item.quantity, uuid: item.product.id };
      });
    return await API.post("orders/", { products }, true);
  }
}

let products;
let API;

async function init() {
  API = new Api("https://prime-garfish-currently.ngrok-free.app");

  const res = await API.get("products/");

  products = res.map((product) => new Product(product));
  console.log(products);

  $pizzasWrapper.innerHTML = "";
  products.forEach((product) => {
    $pizzasWrapper.appendChild(product.card.$element);
  });
}

async function main() {
  const cart = new Cart($cartItemsWrapper, $emptyCart, {
    $orderBtn: $cartOrderBtn,
    $itemsCount: $cartItemsCount,
    $totalPrice: $cartTotalPrice,
  });

  console.log(cart);

  products.forEach((product) => {
    function listener(e) {
      cart.addItem(new CartItem(product));
      product.card.toggle();
      e.target.removeEventListener("click", listener);
    }
    product.card.$cardButtons.$addToCartBtn.addEventListener("click", listener);
  });
}

init().then(main);
