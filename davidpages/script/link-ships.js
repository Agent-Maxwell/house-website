export const shipNames = [
    "androsynth",
    "arilou",
    "chenjesu",
    "chmmr",
    "druuge",
    "earthling",
    "ilwrath",
    "kohr-ah",
    "melnorme",
    "mmrnmhrm",
    "mycon",
    "orz",
    "pkunk",
    "shofixti",
    "slylandro",
    "spathi",
    "supox",
    "syreen",
    "thraddash",
    "umgah",
    "ur-quan",
    "utwig",
    "vux",
    "yehat",
    "zoqfot",
]

export function linkShips(rawHTML) {
    // JSON if you want to do it with a json. copied from card logic.
    // const response = await fetch("/davidpages/card-ids.json");
    // const cardIds = await response.json();

    let formattedHTML = rawHTML;

    // loop thru each ship name
    for (let shipName of shipNames) {
        // g for all instances, () to wrap span around it
        // double escape the b cuz '\b' is a backspace apparently
        // for now, negative lookahead for '.png' to not break the images;
        // more robust, posibly in future, would be to use a treewalker to only look at text nodes.
        const regex = new RegExp(`\\b(${shipName})(?!\.(?:png))\\b`, "gi");
        // no png lookahead
        // const regex = new RegExp(`\\b(${shipName})\\b`, "gi");
        // no double escape b
        // const regex = new RegExp(`\b(${shipName})\b`, "gi");

        // console.log("regex match: " + formattedHTML.match(regex));/////////////////

        const replacement = `<a href='/davidpages/uqm/ship.html?id=${shipName}'><img class="emoji" src="/davidpages/uqm/img/ship-icons/${shipName}.png"> $1</a>`;

        // if (formattedHTML.match(regex)) console.log("replacement: " + replacement);//////////////////

        formattedHTML = formattedHTML.replace(regex, replacement);
    }

    return formattedHTML;
}

