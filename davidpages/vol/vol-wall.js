

// duplicating standard-style behavior:
import {styleCardNames} from "/davidpages/card-names-styler.js";
import {insertEmoji} from "/davidpages/script/insert-emoji.js";
import {insertHome} from "/davidpages/script/insert-home.js";

function numberToLetter(num) {
  let result = '';
  while (num > 0) {
    num--;
    let remainder = num % 26;
    result = String.fromCharCode(97 + remainder) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

// Examples:
// console.log(numberToLetter(1));  // "a"
// console.log(numberToLetter(26)); // "z"
// console.log(numberToLetter(27)); // "aa"
// console.log(numberToLetter(28)); // "ab"

const wall = document.getElementById("vol-wall");

for (let i = 1; i <= 30; i++) {
  const img = document.createElement("img");
  const letter = numberToLetter(i);
  img.src = "https://davidsroom.org/vols/vol-" + letter + ".png";
  img.title = "wow! vol-" + letter + ".png!!!";

  const volDiv = document.createElement("div");
  volDiv.classList.add("vol");
  volDiv.appendChild(img);

  wall.appendChild(volDiv);
}




let formattedHTML = document.body.innerHTML;
formattedHTML = await styleCardNames(formattedHTML);
formattedHTML = insertEmoji(formattedHTML);

document.body.innerHTML = formattedHTML;
insertHome();