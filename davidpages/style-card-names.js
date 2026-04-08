// most basic version of automatic styling for a page. if another script needs to create
// html first, then make a new script that waits for that to be done, then runs this stuff.

import {styleCardNames} from "/davidpages/card-names-styler.js";

const rawHTML = document.body.innerHTML;
const formattedHTML = await styleCardNames(rawHTML);
document.body.innerHTML = formattedHTML;