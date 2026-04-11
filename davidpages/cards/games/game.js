import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

// id from url
const params = new URLSearchParams(window.location.search);
let id = params.get("id");

async function loadPage() {
    // game id - game name
    // const 

    // tab name
    document.title = id;

    // get entry html (or default html if invalid id)
    let rawHTML = null;
    const response = await fetch("html/" + id + ".html");
    if (response.status === 404) {
        console.log("missing html for game id " + id);
        const response = await fetch("html/default.html");
        rawHTML = await response.text();
    } else {
        // get raw html from the [id].html file
        rawHTML = await response.text();
    }

    // RENDER PAGE for VALID ID -------------------------------------------------

    // add card html to the card-content div (under the "back to index" link)
    document.body.innerHTML += rawHTML;
}

await loadPage();

// duplicating standard-style behaviour here for now...
let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);
document.body.innerHTML = formattedHTML;