const $pizzasWrapper = document.querySelector(".pizzas-wrapper");
const $cartWrapper = document.querySelector(".basket-aside");
const $modal = document.querySelector(".order-modal-wrapper");

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
            Authorization: "Bearer " + this.token,
          },
        },
      ];
    } else {
      params = [`${this.url}/${route}`];
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
            Authorization: "Bearer " + this.token,
            "content-type": "application/json",
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

    this.$increaseButton = this.product.card.$cardButtons.$editCartAddButton;
    this.$decreaseButton =
      this.product.card.$cardButtons.$editCartSubtractButton;
    this.$addToCartBtn = this.product.card.$cardButtons.$addToCartBtn;

    this.$increaseButton.addEventListener("click", () => this.increase());
    this.$decreaseButton.addEventListener("click", () => this.decrease());
    this.$addToCartBtn.addEventListener("click", () => this.addToCart());
  }

  calculateTotalPrice() {
    this.totalPrice = this.quantity * this.product.price;
  }

  addToCart() {
    this.quantity = 1;
    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();
    this.product.card.toggle();
  }

  increase() {
    this.quantity++;
    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();
  }

  decrease() {
    this.quantity--;
    console.log(this.quantity);
    if (this.quantity <= 0) {
      this.product.card.toggle();
    }

    this.product.card.updateQuantity(this.quantity);
    this.calculateTotalPrice();
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
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
  API = new Api("http://10.59.122.27:3000");

  const res = await API.get("products/");

  products = res.map((product) => new Product(product));
  console.log(products);

  $pizzasWrapper.innerHTML = "";
  products.forEach((product) => {
    $pizzasWrapper.appendChild(product.card.$element);
  });
}

async function main() {
  const cart = new Cart();

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
