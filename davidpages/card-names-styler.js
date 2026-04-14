import {idToName} from "/davidpages/utils.js";

export async function styleCardNames(rawHTML) {
    // load json that lists all the card ids ---------------------------------
    // get json file
    const response = await fetch("/davidpages/card-ids.json");
    const cardIds = await response.json();

    //    console.log("cardIds: " + cardIds);

    let formattedHTML = rawHTML;

    // loop thru each card name
    for (let cardId of cardIds) {
        const cardName = idToName(cardId);

        //        console.log("checking for id '" + cardId + "', name '" + cardName + "'");//////////////

        // g for all instances, () to wrap span around it
        const regex = new RegExp(`(${cardName})`, "g");

        //        console.log("regex match: " + formattedHTML.match(regex));/////////////////

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

        const replacement = `<a href='/davidpages/cards/encyclopedia/card.html?id=${cardId}' class='${spanClass}'>$1</a>`;

        //        if (formattedHTML.match(regex)) console.log("replacement: " + replacement);//////////////////

        formattedHTML = formattedHTML.replace(regex, replacement);
    }

    return formattedHTML;
}

