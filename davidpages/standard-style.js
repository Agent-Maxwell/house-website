import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {insertHome} from "/davidpages/script/insert-home.js";

let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);

document.body.innerHTML = formattedHTML;
insertHome();