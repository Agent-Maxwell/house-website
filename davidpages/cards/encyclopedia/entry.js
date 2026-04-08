// id from url
const params = new URLSearchParams(window.location.search);
let rawID = params.get("id");

// extra parsing just in case someone types in A J Q K or special chars
rawID = nameToId(rawID);

// optional: push parsed id onto url text?

// now worthy of true "id" status...
const id = rawID;

async function loadPage() {
    // if id makes any sense at all:
    if (id) {
        // first parse id into card name
        let cardName = idToName(id);

        // tab name
        document.title = cardName;
        // image
        document.getElementById("card-img").src = "entry/img/" + id + ".png";

        // get entry html
        const response = await fetch("entry/html/" + id + ".html");
        if (response.status === 404) {
            console.error("missing html for entryID " + id);
        } else {
            const rawHTML = await response.text();

            const formattedHTML = await styleCardNames(rawHTML);

            document.getElementById("content").innerHTML = formattedHTML;
        }
    } else {
        console.error("invalid id: " + id);
    }
}

loadPage();

// THEN style card names
import {styleCardNames} from "/davidpages/card-names-styler.js";

const rawHTML = document.body.innerHTML;
const formattedHTML = await styleCardNames(rawHTML);
document.body.innerHTML = formattedHTML;