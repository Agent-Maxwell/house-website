import {validId, idToName, nameToId, extractRankFromId} from "/davidpages/utils.js";
import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

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

        // get entry html
        let rawHTML = null;
        const idHtmlResponse = await fetch("html/" + id + ".html");
        if (idHtmlResponse.status === 404) {
            console.log("missing html for entryID " + id);
            const response = await fetch("html/default.html");
            rawHTML = await response.text();
        } else {
            // get raw html from the [id].html file
            rawHTML = await idHtmlResponse.text();
        }

        // RENDER PAGE for VALID ID -------------------------------------------------

        // add card html to the card-content div (under the "back to index" link)
        document.getElementById("card-content").innerHTML += rawHTML;

        // automatically add some links at the bottom (in same-rank-container)..........

        // // SAME-RANK HEADING.......................
        // const linksHeading = document.createElement("h2");
        // linksHeading.innerText = idToName(id).slice(0, idToName(id).length - 1) + "";
        // document.getElementById("card-content").appendChild(linksHeading);

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

        const response = await fetch("html/invalid-id.html");
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