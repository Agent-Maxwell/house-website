import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";

// id from url
const params = new URLSearchParams(window.location.search);
let ship = params.get("id");

async function loadPage() {

    // todo check if ship name is valid?
    if (true) {
        // TAB ICON -------------------
        const faviconLink = document.querySelector("link[rel~='icon']");
        faviconLink.href = "/davidpages/uqm/img/ship-icons/" + ship + ".png";

        // TAB NAME -------------------
        document.title = capitalizeShipName(ship);

        // SHIP IMAGE -----------------
        document.getElementById("ship-img").src = "img/ship-stats/" + ship + ".png";
        // todo ship img hovertext w stats

        // SHIP HTML -------------------------------------------

        // get ship html
        let htmlText = null;
        const response = await fetch("html/" + ship + ".html");
        if (response.status === 404) {
            console.log("missing html for ship " + ship);
            const response = await fetch("html/default.html");
            htmlText = await response.text();
        } else {
            // get html text from the [id].html file
            htmlText = await response.text();
        }

        // create fake document from html text
        const parser = new DOMParser();
        const contentDoc = parser.parseFromString(htmlText, 'text/html');

        // define which sections to populate (not counting wiki link)
        const sections = ["attack", "special", "more", "tips"];

        // pluck & place
        sections.forEach(sectionName => {
            // source: the element from the content file with the correct data-section attribute
            const source = contentDoc.querySelector(`[data-section="${sectionName}"]`);
            // destination: the element in the (live) html with the corresponding attribute
            const destination = document.getElementById(`section-${sectionName}`);

            // if both do actually exist,
            if (source && destination) {
                // place! += so as to keep the pre-placed headings;
                destination.innerHTML += source.innerHTML;
            } else { // otherwise,
                // hide sections if the content file doesn't have anything for it
                destination.style.display = "none";
            }

        });

        // WIKI LINK --------------------
        // note: slightly broken for some, possibly just ur-quan & kohr-ah

        // todo if i want to do a data section for it...
        // const wikiUrl = contentDoc.querySelector('[data-section="wiki-url"]').innerHTML;

        // const wikiLink = document.getElementById("wiki-link");
        // wikiLink.href = "https://wiki.uqm.stack.nl/" + ship;
        // wikiLink.innerHTML += " " + capitalizeShipName(ship) + " on the Wiki";

    } else {
        // note: not happening rn
        // RENDER PAGE for INVALID ID------------------------------------------------

        console.error("invalid id: " + id);

        const response = await fetch("html/card/invalid-id.html");
        const htmlText = await response.text();
        
        // replace entire body with invalid-id html page
        document.body.innerHTML = htmlText;
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