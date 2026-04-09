import {styleCardNames} from "/davidpages/card-names-styler.js";

// id from url
const params = new URLSearchParams(window.location.search);
let rawID = params.get("id");

// extra parsing just in case someone types in A J Q K or special chars
rawID = nameToId(rawID);

// optional: push parsed id onto url text?

// now worthy of true "id" status...
const id = rawID;

async function loadPage() {

    let rawHTML = null;

    // if id makes any sense at all:
    // todo make util func for checking if a string is a valid card name; then use invalid-id html if not
    if (id) {
        // first parse id into card name
        let cardName = idToName(id);

        // tab name
        document.title = cardName;
        // image
        document.getElementById("card-img").src = "entry/img/" + id + ".png";

        // get entry html
        const idHtmlResponse = await fetch("entry/html/" + id + ".html");
        if (idHtmlResponse.status === 404) {
            console.log("missing html for entryID " + id);
            const response = await fetch("entry/html/default.html");
            rawHTML = await response.text();
        } else {
            // get raw html from the [id].html file
            rawHTML = await idHtmlResponse.text();
        }
    } else {
        console.error("invalid id: " + id);
        const response = await fetch("entry/html/invalid-id.html");
        rawHTML = await response.text();
    }

    // RENDER PAGE from whatever html ---------------------------------------------

    // style card names (CHANGE moved to end)
    // const formattedHTML = await styleCardNames(rawHTML); ///////////////////////////////

    // add whatever html to the content area (under the card img)
    document.getElementById("card-content").innerHTML = rawHTML;

    // automatically add some card links at the bottom-------------

    // heading
    const linksHeading = document.createElement("h2");
    linksHeading.innerText = idToName(id).slice(0, idToName(id).length - 1) + "s";
    document.getElementById("card-content").appendChild(linksHeading);

    // make a list
    const sameRankList = document.createElement("ul");
    // add a link for each card of the same rank
    const rank = extractRankFromId(id);
    const suits = ["s", "d", "c", "h"];
    suits.forEach((suit) => {
        // create list item with card name (let card name styler do the linking)
        const listItem = document.createElement("li");
        listItem.innerText = idToName("" + rank + suit);
        sameRankList.appendChild(listItem);
    });
    document.getElementById("card-content").appendChild(sameRankList);
}

await loadPage();

// THEN style card names
const formattedHTML = await styleCardNames(document.body.innerHTML);
// add it to the document
document.body.innerHTML = formattedHTML;