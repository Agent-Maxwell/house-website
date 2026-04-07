const response = await fetch("/davidpages/card-ids.json");
const cardIds = await response.json();

for (let cardId of cardIds) {
    const container = document.getElementById("card-button-container");

    // BUTTON -------------------------------------------
    // 1. CREATE the element
    const newButton = document.createElement('div');
    // 2. CONFIGURE (Class, Text, Attributes)
    newButton.classList.add('card-button'); // Adds a class
    // 3. ATTACH to a parent
    container.appendChild(newButton);
//    console.log(newButton); ///////////////////////////////

    // TEXT ---------------------------------------------
    // 1. CREATE the element
    const newText = document.createElement('p');
    // 2. CONFIGURE (Class, Text, Attributes)
    newText.classList.add('card-button-text');
    newText.innerText = idToName(cardId);
    // 3. ATTACH to a parent
    newButton.appendChild(newText);
}

// THEN style card names
import {formatHTML} from "/davidpages/card-names-styler.js";

const rawHTML = document.body.innerHTML;
const formattedHTML = await formatHTML(rawHTML);
document.body.innerHTML = formattedHTML;