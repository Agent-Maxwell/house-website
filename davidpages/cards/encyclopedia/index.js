import {styleCardNames} from "/davidpages/card-names-styler.js";
import {idToName} from "/davidpages/utils.js";
import {insertHome} from "/davidpages/script/insert-home.js";

const cardIds = [
    "1s",
    "2s",
    "3s",
    "4s",
    "5s",
    "6s",
    "7s",
    "8s",
    "9s",
    "10s",
    "11s",
    "12s",
    "13s",
    "1d",
    "2d",
    "3d",
    "4d",
    "5d",
    "6d",
    "7d",
    "8d",
    "9d",
    "10d",
    "11d",
    "12d",
    "13d",
    "1c",
    "2c",
    "3c",
    "4c",
    "5c",
    "6c",
    "7c",
    "8c",
    "9c",
    "10c",
    "11c",
    "12c",
    "13c",
    "1h",
    "2h",
    "3h",
    "4h",
    "5h",
    "6h",
    "7h",
    "8h",
    "9h",
    "10h",
    "11h",
    "12h",
    "13h"
]

for (let cardId of cardIds) {
    const container = document.getElementById("card-button-container");

    // DIV -------------------------------------------
    const div = document.createElement('div');
    div.innerText = idToName(cardId);
    div.classList.add('card-button'); // Adds a class
    // container.appendChild(div);
    container.appendChild(div);

    // LINK -------------------------------------------
    // this is an empty link that has css to make it expand to fill the div
    const link = document.createElement('a');
    link.href = "/davidpages/cards/encyclopedia/card.html?id=" + cardId;
    link.classList.add('card-button-link');
    div.appendChild(link);
}

// duplicating standard style behavior here for now...
const rawHTML = document.body.innerHTML;
const formattedHTML = await styleCardNames(rawHTML);
document.body.innerHTML = formattedHTML;
insertHome();