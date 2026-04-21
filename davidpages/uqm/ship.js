import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

// id from url
const params = new URLSearchParams(window.location.search);
let ship = params.get("id");

async function loadPage() {

    // todo check if ship name is valid
    if (ship) {
        // tab name
        document.title = ship;
        // image
        document.getElementById("ship-img").src = "img/ship-stats/" + ship + ".png";
        document.getElementById("ship-img").style.imageRendering = "pixelated";

        // get ship entry html
        let rawHTML = null;
        const idHtmlResponse = await fetch("html/" + ship + ".html");
        if (idHtmlResponse.status === 404) {
            console.log("missing html for ship " + ship);
            const response = await fetch("html/default.html");
            rawHTML = await response.text();
        } else {
            // get raw html from the [id].html file
            rawHTML = await idHtmlResponse.text();
        }

        // RENDER PAGE for VALID ID -------------------------------------------------

        document.getElementById("ship-content").innerHTML += rawHTML;

        // WIKI LINK
        const wikiLink = document.getElementById("link");
        wikiLink.href = "https://wiki.uqm.stack.nl/" + ship;
        document.body.appendChild(wikiLink);

        // const wikiLink = document.getElementById("wiki-link");

    } else {
        // RENDER PAGE for INVALID ID------------------------------------------------

        console.error("invalid id: " + id);

        const response = await fetch("html/card/invalid-id.html");
        const rawHTML = await response.text();
        
        // replace entire body with invalid-id html page
        document.body.innerHTML = rawHTML;
    }
}

await loadPage();

// duplicating standard-style behaviour here for now...
let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);
document.body.innerHTML = formattedHTML;