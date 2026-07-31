// copied from card encyclopedia, simplified.

// import {validId, idToName, nameToId, extractRankFromId} from "/davidpages/utils.js";
import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

// id from url
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadPage() {

    // first parse id into card name
    // let cardName = idToName(id);

    // tab name
    document.title = id;
    // image
    document.getElementById("deck-img").src = "img/" + id + ".jpg";
    document.getElementById("deck-spread-img").src = "img/" + id + "-spread.jpg";
    // todoother images..?

    // get deck entry html
    let rawHTML = null;
    const idHtmlResponse = await fetch("html/" + id + ".html");
    if (idHtmlResponse.status === 404) {
        console.log("missing html for entryID " + id);
        // pivot to default
        const defaultHtmlResponse = await fetch("html/default.html");
        const rawDefaultHTML = await defaultHtmlResponse.text();
        document.getElementById("deck-content").innerHTML += rawDefaultHTML;

        // rawHTML = await response.text();
    } else {
        // get raw html from the [id].html file
        rawHTML = await idHtmlResponse.text();
        document.getElementById("deck-content").innerHTML += rawHTML;
    }

    // RENDER PAGE for VALID ID mmoved up there -------------------------------------------------

    // add deck html to the deck-content div
}

await loadPage();

// duplicating standard-style behaviour here for now...
let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);
document.body.innerHTML = formattedHTML;