const validIds = [
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
  "13h",
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
  "13d"
]

// check if something is a valid id
export function validId(inputId) {
    return validIds.includes(inputId);
}

// translate id -> just rank number
export function extractRankFromId(inputId) {
    if (!validId(inputId)) console.log("extractRankFromId invalid ID: " + inputId);
    return inputId.slice(0, inputId.length - 1)
}

// translate id -> just the suit letter
export function extractSuitFromId(inputId) {
    if (!validId(inputId)) console.log("extractSuitFromId invalid ID: " + inputId);
    return inputId.slice(inputId.length - 1)
}

// translate card id -> namez
export function idToName(inputId) {
    if (!validId(inputId)) console.log("extractSuitFromId invalid ID: " + inputId);
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
export function nameToId(inputName) {
    if (inputName == null) {
        console.log("nameToId called with null");
        return null;
    }

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

    if (!validId(id)) console.log("nameToId invalid name: " + inputName);
    // .. or at least whatever it was led to an invalid ID
    return id;
}