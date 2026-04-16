function getData(form) {
  var formData = new FormData(form);

  for (var pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  console.log(Object.fromEntries(formData));
}

document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();
  getData(e.target);
//   document.getElementById("question").innerText = "are you more of a red or blue persona?"
});

// copied from
// https://codepen.io/kevinfarrugia/pen/Wommgd?editors=1111