import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {linkShips} from "/davidpages/script/link-ships.js";

// duplicated from index.js for now. should probably do json in the future or whatever
const ships = [
    {
        nameOrder: 1,
        name: "Androsynth",
        crew: 20,
        batt: 24,
        value: 15,
    },
    {
        nameOrder: 2,
        name: "Arilou",
        crew: 6,
        batt: 20,
        value: 16,
    },
    {
        nameOrder: 3,
        name: "Chenjesu",
        crew: 36,
        batt: 30,
        value: 28,
    },
    {
        nameOrder: 4,
        name: "Chmmr",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 5,
        name: "Druuge",
        crew: 14,
        batt: 32,
        value: 17,
    },
    {
        nameOrder: 6,
        name: "Earthling",
        crew: 18,
        batt: 18,
        value: 11,
    },
    {
        nameOrder: 7,
        name: "Ilwrath",
        crew: 22,
        batt: 16,
        value: 10,
    },
    {
        nameOrder: 8,
        name: "Kohr-Ah",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 9,
        name: "Melnorme",
        crew: 20,
        batt: 42,
        value: 18,
    },
    {
        nameOrder: 10,
        name: "Mmrnmhrm",
        crew: 20,
        batt: 10,
        value: 19,
    },
    {
        nameOrder: 11,
        name: "Mycon",
        crew: 20,
        batt: 40,
        value: 21,
    },
    {
        nameOrder: 12,
        name: "Orz",
        crew: 16,
        batt: 20,
        value: 23,
    },
    {
        nameOrder: 13,
        name: "Pkunk",
        crew: 8,
        batt: 12,
        value: 20,
    },
    {
        nameOrder: 14,
        name: "Shofixti",
        crew: 6,
        batt: 4,
        value: 5,
    },
    {
        nameOrder: 15,
        name: "Slylandro",
        crew: 12,
        batt: 20,
        value: 17,
    },
    {
        nameOrder: 16,
        name: "Spathi",
        crew: 30,
        batt: 10,
        value: 18,
    },
    {
        nameOrder: 17,
        name: "Supox",
        crew: 12,
        batt: 16,
        value: 16,
    },
    {
        nameOrder: 18,
        name: "Syreen",
        crew: 12, // syreen funny, max 42
        batt: 16,
        value: 13,
    },
    {
        nameOrder: 19,
        name: "Thraddash",
        crew: 8,
        batt: 24,
        value: 10,
    },
    {
        nameOrder: 20,
        name: "Umgah",
        crew: 10,
        batt: 30,
        value: 7,
    },
    {
        nameOrder: 21,
        name: "Ur-Quan",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 22,
        name: "Utwig",
        crew: 20,
        batt: 10, // utwig funny, max 20
        value: 22,
    },
    {
        nameOrder: 23,
        name: "Vux",
        crew: 20,
        batt: 40,
        value: 12,
    },
    {
        nameOrder: 24,
        name: "Yehat",
        crew: 20,
        batt: 10,
        value: 23,
    },
    {
        nameOrder: 25,
        name: "ZoqFot",
        crew: 10,
        batt: 10,
        value: 6,
    }
]

// id from url
const params = new URLSearchParams(window.location.search);
let shipId = params.get("id");

async function loadPage() {

    // todo check if ship name is valid?
    if (true) {
        // TAB ICON -------------------
        const faviconLink = document.querySelector("link[rel~='icon']");
        faviconLink.href = "/davidpages/uqm/img/ship-icons/" + shipId + ".png";

        // TAB NAME -------------------
        document.title = capitalizeShipName(shipId);

        // SHIP IMAGE -----------------
        const shipImg = document.getElementById("ship-img");
        shipImg.src = "img/ship-stats/" + shipId + ".png";

        // SHIP IMAGE HOVERTEXT
        // (crew, batt)
        const shipObj = ships.find((obj) => {
            return obj.name.toLowerCase() == shipId;
        });
        shipImg.title = "Crew: " + shipObj.crew + ", Batt: " + shipObj.batt;

        // SHIP HTML -------------------------------------------

        // get ship html
        let htmlText = null;
        const response = await fetch("html/" + shipId + ".html");
        if (response.status === 404) {
            console.log("missing html for ship " + shipId);
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
        const sections = ["attack", "special", "more", "extra", "tips"];

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
formattedHTML = linkShips(formattedHTML);
document.body.innerHTML = formattedHTML;