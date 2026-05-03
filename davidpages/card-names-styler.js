import {idToName} from "/davidpages/utils.js";

export async function styleCardNames(rawHTML) {
    
    const cardIds = [
        "1s",
        "2s",
        "3s",
        "4s",
        "5s",
        "6s",
        "7s",
        "8s",
        "9s",
        "10s",
        "11s",
        "12s",
        "13s",
        "1d",
        "2d",
        "3d",
        "4d",
        "5d",
        "6d",
        "7d",
        "8d",
        "9d",
        "10d",
        "11d",
        "12d",
        "13d",
        "1c",
        "2c",
        "3c",
        "4c",
        "5c",
        "6c",
        "7c",
        "8c",
        "9c",
        "10c",
        "11c",
        "12c",
        "13c",
        "1h",
        "2h",
        "3h",
        "4h",
        "5h",
        "6h",
        "7h",
        "8h",
        "9h",
        "10h",
        "11h",
        "12h",
        "13h"
    ]

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

