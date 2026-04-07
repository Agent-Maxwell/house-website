// most basic version of automatic styling for a page. if another script needs to create
// html first, then make a new script that waits for that to be done, then runs this stuff.

import {formatHTML} from "/davidpages/card-names-styler.js";
// broken in localhost, tries to go to
// http://localhost:63342/davidpages/card-names-styler.js
// instead of
// http://localhost:63342/house-website/davidpages/card-names-styler.js

const rawHTML = document.body.innerHTML;
const formattedHTML = await formatHTML(rawHTML);
document.body.innerHTML = formattedHTML;