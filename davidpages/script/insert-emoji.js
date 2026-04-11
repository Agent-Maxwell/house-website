export function insertEmoji(rawHTML) {

    const regex = new RegExp(`::(.*?)::`, 'g');
    // const replacement = `::sunglasses::`;
    const replacement = `<img class="emoji" src="/davidpages/emoji/$1.gif">`;

    // const regex = new RegExp("and", 'g');
    // const replacement = "AND";
    
    const formattedHTML = rawHTML.replace(regex, replacement);

    return formattedHTML;
}

// const newHTML = insertEmoji(document.body.innerHTML);
// document.body.innerHTML = newHTML;