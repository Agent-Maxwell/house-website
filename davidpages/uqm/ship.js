import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {shipNames, linkShips} from "/davidpages/script/link-ships.js";

// duplicated from index.js for now. should probably do json in the future or whatever
const ships = [
    {
        nameOrder: 1,
        name: "Androsynth",
        crew: 20,
        batt: 24,
        value: 15,
        davidScore: 7,
        card: "6b"
    },
    {
        nameOrder: 2,
        name: "Arilou",
        crew: 6,
        batt: 20,
        value: 16,
        davidScore: 8,
        card: "7r"
    },
    {
        nameOrder: 3,
        name: "Chenjesu",
        crew: 36,
        batt: 30,
        value: 28,
        davidScore: 11,
        card: "Kr"
    },
    {
        nameOrder: 4,
        name: "Chmmr",
        crew: 42,
        batt: 42,
        value: 30,
        davidScore: 13,
        card: "Kb"
    },
    {
        nameOrder: 5,
        name: "Druuge",
        crew: 14,
        batt: 32,
        value: 17,
        davidScore: 18,
        card: "8b"
    },
    {
        nameOrder: 6,
        name: "Earthling",
        crew: 18,
        batt: 18,
        value: 11,
        davidScore: 9,
        card: "5b"
    },
    {
        nameOrder: 7,
        name: "Ilwrath",
        crew: 22,
        batt: 16,
        value: 10,
        davidScore: 21,
        card: "4b"
    },
    {
        nameOrder: 8,
        name: "Kohr-Ah",
        crew: 42,
        batt: 42,
        value: 30,
        davidScore: 25,
        card: "Ab"
    },
    {
        nameOrder: 9,
        name: "Melnorme",
        crew: 20,
        batt: 42,
        value: 18,
        davidScore: 19,
        card: "9b"
    },
    {
        nameOrder: 10,
        name: "Mmrnmhrm",
        crew: 20,
        batt: 10,
        value: 19,
        davidScore: 14,
        card: "10b"
    },
    {
        nameOrder: 11,
        name: "Mycon",
        crew: 20,
        batt: 40,
        value: 21,
        davidScore: 24,
        card: "Jr"
    },
    {
        nameOrder: 12,
        name: "Orz",
        crew: 16,
        batt: 20,
        value: 23,
        davidScore: 5,
        card: "Qb"
    },
    {
        nameOrder: 13,
        name: "Pkunk",
        crew: 8,
        batt: 12,
        value: 20,
        davidScore: 6,
        card: "10r"
    },
    {
        nameOrder: 14,
        name: "Shofixti",
        crew: 6,
        batt: 4,
        value: 5,
        davidScore: 10,
        card: "2b"
    },
    {
        nameOrder: 15,
        name: "Slylandro",
        crew: 12,
        batt: 20,
        value: 17,
        davidScore: 12,
        card: "8r"
    },
    {
        nameOrder: 16,
        name: "Spathi",
        crew: 30,
        batt: 10,
        value: 18,
        davidScore: 1,
        card: "9r"
    },
    {
        nameOrder: 17,
        name: "Supox",
        crew: 12,
        batt: 16,
        value: 16,
        davidScore: 20,
        card: "7b"
    },
    {
        nameOrder: 18,
        name: "Syreen",
        crew: 12, // syreen funny, max 42
        batt: 16,
        value: 13,
        davidScore: 3,
        card: "6r"
    },
    {
        nameOrder: 19,
        name: "Thraddash",
        crew: 8,
        batt: 24,
        value: 10,
        davidScore: 15,
        card: "4r"
    },
    {
        nameOrder: 20,
        name: "Umgah",
        crew: 10,
        batt: 30,
        value: 7,
        davidScore: 22,
        card: "3r"
    },
    {
        nameOrder: 21,
        name: "Ur-Quan",
        crew: 42,
        batt: 42,
        value: 30,
        davidScore: 16,
        card: "Ar"
    },
    {
        nameOrder: 22,
        name: "Utwig",
        crew: 20,
        batt: 10, // utwig funny, max 20
        value: 22,
        davidScore: 2,
        card: "Jb"
    },
    {
        nameOrder: 23,
        name: "Vux",
        crew: 20,
        batt: 40,
        value: 12,
        davidScore: 4,
        card: "5r"
    },
    {
        nameOrder: 24,
        name: "Yehat",
        crew: 20,
        batt: 10,
        value: 23,
        davidScore: 23,
        card: "Qr"
    },
    {
        nameOrder: 25,
        name: "ZoqFot",
        crew: 10,
        batt: 10,
        value: 6,
        davidScore: 17,
        card: "3b",
    }
]

// id from url
const params = new URLSearchParams(window.location.search);
let shipId = params.get("id");

// handle random:
if (shipId === "random") {
    //stealing shipNames from link-ships, theyre the standard lowercase ones used for ids
    const randIndex = Math.round(Math.random() * shipNames.length);
    shipId = shipNames[randIndex];
    console.log(randIndex);
    //update the url..?
    params.set("id", shipId);
    // new url: current directory, plus updated params.
    // note. replace: do not preserve current state for back button. push: do reserve, ie, back button goes back to random state.
    window.history.replaceState(null, "", window.location.pathname + "?" + params.toString());
}

// get obj w stats
const shipObj = ships.find((obj) => {
    return obj.name.toLowerCase() == shipId;
});

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

        // SHIP IMAGE HOVERTEXT (crew, batt)
        if (shipObj.name === "Syreen") {
            // EXCEPTION: syreen (crew/max-crew, batt)
            shipImg.title = "Crew: " + shipObj.crew + "/42, Batt: " + shipObj.batt;

        } else if (shipObj.name === "Utwig") {
            // EXCEPTION: utwig (crew, batt/max-batt)
            shipImg.title = "Crew: " + shipObj.crew + ", Batt: " + shipObj.batt + "/20";
        } else {
            shipImg.title = "Crew: " + shipObj.crew + ", Batt: " + shipObj.batt;
        }

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

        // create link to ASSOCIATED CARD
        const playingCardLink = document.createElement("p");
        playingCardLink.classList.add("card-link");
        playingCardLink.title = "Associated cards"

        // extract rank and color from ship's "card" value
        const cardColor = shipObj.card.slice(-1);
        const cardRank = shipObj.card.slice(0, -1);
        // format the two associated card names
        let cardText;
        if (cardColor === "b") {
            cardText = cardRank + "♠ / " + cardRank + "♣";
        } else if (cardColor === "r") {
            cardText = cardRank + "♦ / " + cardRank + "♥";
        } else {
            cardText = cardRank + "? / " + cardRank + "? wtf is color '" + cardColor + "'??";
        }

        console.log(cardRank);

        playingCardLink.innerText = cardText;
        document.body.appendChild(playingCardLink);

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

// left/right arrows goes to other ships
//(shipObj copied from above)
document.addEventListener("keydown", (e) => {
    // LEFT
    if (e.code == "ArrowLeft") {
        // find previous ship (in name order)
        const prevShipObj = ships.find((obj) => {
            return obj.nameOrder == shipObj.nameOrder - 1;
        });
        // if a previous ship exists,
        if (prevShipObj) {
            // go there...!
            window.location.href = "ship.html?id=" + prevShipObj.name.toLowerCase();
        }
    // RIGHT
    } else if (e.code == "ArrowRight") {
        // find next ship (in name order)
        const nextShipObj = ships.find((obj) => {
            return obj.nameOrder == shipObj.nameOrder + 1;
        });
        // if a next ship exists,
        if (nextShipObj) {
            // go there...!
            window.location.href = "ship.html?id=" + nextShipObj.name.toLowerCase();
        }
    }
});


// actually load the page
await loadPage();

// duplicating standard-style behaviour here for now...
let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);
formattedHTML = linkShips(formattedHTML);
document.body.innerHTML = formattedHTML;