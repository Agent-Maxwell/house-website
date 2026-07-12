import {validId, idToName, nameToId, extractRankFromId} from "/davidpages/utils.js";
import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {linkShips} from "/davidpages/script/link-ships.js";

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
    if (validId(id)) {
        // first parse id into card name
        let cardName = idToName(id);

        // tab name
        document.title = cardName;
        // image
        document.getElementById("card-img").src = "img/" + id + ".png";

        // get card entry html
        let rawHTML = null;
        const idHtmlResponse = await fetch("html/card/" + id + ".html");
        if (idHtmlResponse.status === 404) {
            console.log("missing html for entryID " + id);
            const response = await fetch("html/card/default.html");
            rawHTML = await response.text();
        } else {
            // get raw html from the [id].html file
            rawHTML = await idHtmlResponse.text();
        }


        // COPIED FROM ship.js FOR STANDARD SECTIONS
        // create fake document from html text
        const parser = new DOMParser();
        const contentDoc = parser.parseFromString(rawHTML, 'text/html');

        // define which sections to populate
        const sections = ["normal", "ship", "quote", "fortune"];

        // pluck & place
        sections.forEach(sectionName => {
            // source: the element from the content file with the correct data-section attribute
            const source = contentDoc.querySelector(`[data-section="${sectionName}"]`);
            // destination: the element in the (live) html with the corresponding attribute
            const destination = document.getElementById(`section-${sectionName}`);

            // if both do actually exist,
            if (source && destination) {
                // if any standard (non-normal) section exists, show the box.
                if (sectionName !== "normal")
                    document.getElementById("standard-section-box").style.display = "flex";
                // place! += so as to keep the pre-placed headings;
                destination.innerHTML += source.innerHTML;
            } else { // otherwise,
                // hide sections if the content file doesn't have anything for it
                destination.style.display = "none";
            }

        });

        // FLEXBOX VERSION of same-rank links .......................................

        // add a link for each card of the same rank
        const rank = extractRankFromId(id);
        const suits = ["s", "d", "c", "h"];
        suits.forEach((suit) => {
            // create text (let card name styler do the linking)
            const listItem = document.createElement("p");
            listItem.innerText = idToName("" + rank + suit);
            document.getElementById("same-rank-container").appendChild(listItem);
        });

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
formattedHTML = linkShips(formattedHTML);
document.body.innerHTML = formattedHTML;