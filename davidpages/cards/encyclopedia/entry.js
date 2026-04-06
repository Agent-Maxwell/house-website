// todo seperate out the formatting card links functionality so it can be used anywhere on the site



// id from url
const params = new URLSearchParams(window.location.search);
let rawID = params.get("id");

// extra parsing just in case someone types in A J Q K or special chars
rawID = nameToId(rawID);

// optional: push parsed id onto url text?

// now worthy of true "id" status...
const id = rawID;

async function loadPage() {
    // first parse id into card name
    let cardName = idToName(id);

    // tab name
    document.title = cardName;
    // image
    document.getElementById("card-img").src = "entry/img/" + id + ".png";

    const response = await fetch("entry/html/" + id + ".html");
    if (response.status === 404) {
        console.error("missing html for entryID " + id);
    } else {
        const rawHTML = await response.text();

        const formattedHTML = await formatHTML(rawHTML);

        document.getElementById("content").innerHTML = formattedHTML;
    }
}

async function formatHTML(rawHTML) {
    // load json that lists all the card ids ---------------------------------
    // get json file
    const response = await fetch("card-ids.json");
    const cardIds = await response.json();

    let formattedHTML = rawHTML;

    // loop thru each card name
    for (let cardId of cardIds) {
        const cardName = idToName(cardId);

//        console.log("checking for id '" + cardId + "', name '" + cardName + "'");//////////////

        // g for all instances, () to wrap span around it
        const regex = new RegExp(`(${cardName})`, "g");

        console.log("regex match: " + formattedHTML.match(regex));/////////////////

        let spanClass = null;
        // set span class (ie suit color) based on last character of id:
        const lastChar = cardId.slice(cardId.length - 1);
        switch (lastChar) {
            case "s":
            case "c":
                spanClass = "black-suit";
                break;
            case "h":
            case "d":
                spanClass = "red-suit";
                break;
            default:
                console.log("invalid suit: " + lastChar);////////////////////////
        }

        const replacement = `<a href='entry.html?id=${cardId}' class='${spanClass}'>$1</a>`;

        if (formattedHTML.match(regex)) console.log("replacement: " + replacement);//////////////////

        formattedHTML = formattedHTML.replace(regex, replacement);
    }

    return formattedHTML;
}

// translate card id -> name
function idToName(inputId) {
    let name = inputId;
    name = name.replace("s", "♠");
    name = name.replace("c", "♣");
    name = name.replace("h", "♥");
    name = name.replace("d", "♦");
    // matches a "1" at start not followed by another digit, OR 14. ie aces.
    name = name.replace(/(^1(?![01234])|14)/, "A");
    name = name.replace("11", "J");
    name = name.replace("12", "Q");
    name = name.replace("13", "K");

    return name;
}

// translate card name -> id
function nameToId(inputName) {
    let id = inputName;

    // 14 -> A
    id = id.replace("14", "A");

    // case insensitive replace ajqk with numbers
    id = id.replace(/a/i, "1");
    id = id.replace(/j/i, "11");
    id = id.replace(/q/i, "12");
    id = id.replace(/k/i, "13");
    // replace special chars with letters
    id = id.replace("♠", "s");
    id = id.replace("♣", "c");
    id = id.replace("♥", "h");
    id = id.replace("♦", "d");

    return id;
}

loadPage();