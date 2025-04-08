const $pizzasWrapper = document.querySelector(".pizzas-wrapper");
const $cartWrapper = document.querySelector(".basket-aside");
const $modal = document.querySelector(".order-modal-wrapper");

class Api {
  constructor(url) {
    this.url = url;
    this.token = localStorage.getItem("accessToken") || null;
  }

  async connect(email, password) {
    const token = await this.post("auth/login/", { email, password });
    this.token = token;
    return token;
  }

  decodeJson(body) {
    return body.json();
  }

  parseToJSON(body) {
    return JSON.stringify(body);
  }

  async get(route, hasToken) {
    return hasToken
      ? this.decodeJson(
          await fetch(`${this.url}/${route}`, {
            headers: {
              Authorization: this.token,
            },
          })
        )
      : this.decodeJson(await fetch(`${this.url}/${route}`));
  }

  post(route, body, hasToken) {
    return hasToken
      ? fetch(`${this.url}${route}`, {
          method: "POST",
          headers: {
            Authorization: this.token,
            "content-type": "application/",
          },
          body: this.parseToJSON(body),
        })
      : fetch(`${this.url}${route}`, {
          method: "POST",
          body: this.parseToJSON(body),
        });
  }
}

class Product {
  constructor({ id, name, description, price, image }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
  }

  getCard() {
    const card = document.createElement("div");
    card.classList.add("pizza-item");
    card.dataset.id = this.id;

    const mainPicture = document.createElement("img");
    mainPicture.classList.add("pizza-picture");
    mainPicture.src = this.image;

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
    pizzaName.textContent = this.name;

    const pizzaPrice = document.createElement("li");
    pizzaPrice.classList.add("pizza-price");
    pizzaPrice.textContent = "$" + this.price.toFixed(2);

    pizzaInfos.appendChild(pizzaName);
    pizzaInfos.appendChild(pizzaPrice);

    card.appendChild(pizzaInfos);

    return card;
  }
}

class Cart {
  constructor() {
    this.items = {};
  }

  appendItem(product) {
    this.items[product.id] = { quantity: 1, product };
  }

  removeItem(product) {
    delete this.items[product.id];
  }
}

async function main() {
  const API = new Api("http://10.59.122.150:3000");

  const res = await API.get("");

  console.log("===");
  console.log(res);
  console.log("===");
}

main();
