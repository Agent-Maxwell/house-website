import {styleCardNames} from "/davidpages/card-names-styler.js";
import {idToName} from "/davidpages/utils.js";


const response = await fetch("/davidpages/card-ids.json");
const cardIds = await response.json();

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
    link.href = "/davidpages/cards/encyclopedia/entry.html?id=" + cardId;
    link.classList.add('card-button-link');
    div.appendChild(link);
}

// duplicating standard style behavior here for now...
const rawHTML = document.body.innerHTML;
const formattedHTML = await styleCardNames(rawHTML);
document.body.innerHTML = formattedHTML;