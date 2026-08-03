

// duplicating standard-style behavior:
import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {insertHome} from "/davidpages/script/insert-home.js";




for (let i = 1; i <= 20; i++) {
  const img = document.createElement("img");
  // note: vols-1 is a png rn
  if (i === 19) img.src = "https://davidsroom.org/vols/vols-19.png";
  else img.src = "https://davidsroom.org/vols/vols-" + i + ".jpeg";
  img.title = "wow! vols-" + i + ".jpeg!!!";
  img.classList.add("vol");
  // document.body.innerHTML += img;
  document.body.appendChild(img);
  // console.log("hello");
}




let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);

document.body.innerHTML = formattedHTML;
insertHome();