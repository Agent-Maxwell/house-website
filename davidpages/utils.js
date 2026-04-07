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