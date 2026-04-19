const form = document.getElementById("myForm");
const fsdfsdf = document.getElementById("myForm");

function setupForm() {

}


function getData(form) {
  const formData = new FormData(form);

  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  console.log(Object.fromEntries(formData));
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  getData(e.target);
//   document.getElementById("question").innerText = "are you more of a red or blue persona?"
});

// copied from
// https://codepen.io/kevinfarrugia/pen/Wommgd?editors=1111