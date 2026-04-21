import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

// id from url
const params = new URLSearchParams(window.location.search);
let ship = params.get("id");

async function loadPage() {

    // todo check if ship name is valid?
    if (true) {
        // tab icon
        const faviconLink = document.querySelector("link[rel~='icon']");
        faviconLink.href = "/davidpages/uqm/img/ship-icons/" + ship + ".png";

        // tab name
        document.title = capitalizeShipName(ship);

        // ship-img
        document.getElementById("ship-img").src = "img/ship-stats/" + ship + ".png";

        // get ship-content html
        let rawHTML = null;
        const response = await fetch("html/" + ship + ".html");
        if (response.status === 404) {
            console.log("missing html for ship " + ship);
            const response = await fetch("html/default.html");
            rawHTML = await response.text();
        } else {
            // get raw html from the [id].html file
            rawHTML = await response.text();
        }
        // apply ship-content html
        document.getElementById("ship-content").innerHTML += rawHTML;



        // wiki link
        // note: slightly broken for some, possibly just ur-quan & kohr-ah
        const wikiLink = document.getElementById("wiki-link");
        wikiLink.href = "https://wiki.uqm.stack.nl/" + ship;
        document.getElementById("ship-content").appendChild(wikiLink);

    } else {
        // note: not happening rn
        // RENDER PAGE for INVALID ID------------------------------------------------

        console.error("invalid id: " + id);

        const response = await fetch("html/card/invalid-id.html");
        const rawHTML = await response.text();
        
        // replace entire body with invalid-id html page
        document.body.innerHTML = rawHTML;
    }
}

// FUNCTIONS

function capitalizeShipName(id) {
    // capitalization exception: ZoqFot
    if (id == "zoqfot") {
        return "ZoqFot";
    }
    return toTitleCase(id);
}

// Source - https://stackoverflow.com/a/196991
// Posted by Greg Dean, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-21, License - CC BY-SA 4.0
function toTitleCase(str) {
    return str.replace(
        /\w*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

//////////////////////////////////////////////////////////////////

// actually load the page
await loadPage();

// duplicating standard-style behaviour here for now...
let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);
document.body.innerHTML = formattedHTML;