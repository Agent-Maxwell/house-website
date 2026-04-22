const ships = [
    {
        nameOrder: 1,
        name: "Androsynth",
        crew: 20,
        batt: 24,
        value: 15,
    },
    {
        nameOrder: 2,
        name: "Arilou",
        crew: 6,
        batt: 20,
        value: 16,
    },
    {
        nameOrder: 3,
        name: "Chenjesu",
        crew: 36,
        batt: 30,
        value: 28,
    },
    {
        nameOrder: 4,
        name: "Chmmr",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 5,
        name: "Druuge",
        crew: 14,
        batt: 32,
        value: 17,
    },
    {
        nameOrder: 6,
        name: "Earthling",
        crew: 18,
        batt: 18,
        value: 11,
    },
    {
        nameOrder: 7,
        name: "Ilwrath",
        crew: 22,
        batt: 16,
        value: 10,
    },
    {
        nameOrder: 8,
        name: "Kohr-Ah",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 9,
        name: "Melnorme",
        crew: 20,
        batt: 42,
        value: 18,
    },
    {
        nameOrder: 10,
        name: "Mmrnmhrm",
        crew: 20,
        batt: 10,
        value: 19,
    },
    {
        nameOrder: 11,
        name: "Mycon",
        crew: 20,
        batt: 40,
        value: 21,
    },
    {
        nameOrder: 12,
        name: "Orz",
        crew: 16,
        batt: 20,
        value: 23,
    },
    {
        nameOrder: 13,
        name: "Pkunk",
        crew: 8,
        batt: 12,
        value: 20,
    },
    {
        nameOrder: 14,
        name: "Shofixti",
        crew: 6,
        batt: 4,
        value: 5,
    },
    {
        nameOrder: 15,
        name: "Slylandro",
        crew: 12,
        batt: 20,
        value: 17,
    },
    {
        nameOrder: 16,
        name: "Spathi",
        crew: 30,
        batt: 10,
        value: 18,
    },
    {
        nameOrder: 17,
        name: "Supox",
        crew: 12,
        batt: 16,
        value: 16,
    },
    {
        nameOrder: 18,
        name: "Syreen",
        crew: 12, // syreen funny, max 42
        batt: 16,
        value: 13,
    },
    {
        nameOrder: 19,
        name: "Thraddash",
        crew: 8,
        batt: 24,
        value: 10,
    },
    {
        nameOrder: 20,
        name: "Umgah",
        crew: 10,
        batt: 30,
        value: 7,
    },
    {
        nameOrder: 21,
        name: "Ur-Quan",
        crew: 42,
        batt: 42,
        value: 30,
    },
    {
        nameOrder: 22,
        name: "Utwig",
        crew: 20,
        batt: 10, // utwig funny, max 20
        value: 22,
    },
    {
        nameOrder: 23,
        name: "Vux",
        crew: 20,
        batt: 40,
        value: 12,
    },
    {
        nameOrder: 24,
        name: "Yehat",
        crew: 20,
        batt: 10,
        value: 23,
    },
    {
        nameOrder: 25,
        name: "ZoqFot",
        crew: 10,
        batt: 10,
        value: 6,
    }
]

let order = "ascending";
let currentSortBy = null;
sortBy("nameOrder");

// set ship img src's
for (ship of ships) {
    // Set src's
    const shipImg = document.getElementById(ship.name.toLowerCase());
    shipImg.src = "img/ship-stats/" + ship.name.toLowerCase() + ".png";

    // todo also set link href's here
    shipImg.parentElement.href = "ship.html?id=" + ship.name.toLowerCase();
}

// get sortBy radio buttons
const sortByButtons = document.querySelectorAll('input[name="sort-by"]');
// function to change ship css ordering
function sortBy(what) {
    currentSortBy = what;

    for (ship of ships) {
        const shipImg = document.getElementById(ship.name.toLowerCase());

        // set the CSS order of the shipimg parents, in WHAT order
        switch (order) {
            case "ascending":
                shipImg.parentElement.style.order = ship[currentSortBy];
            break;
            case "descending":
                shipImg.parentElement.style.order = -ship[currentSortBy];
            break;
            default:
                console.log("invalid ordering: " + order);
        }

        // also set image hover text to show info
        switch (currentSortBy) {
            case "nameOrder":
                shipImg.title = ship.name;
                break;
            case "crew":
                shipImg.title = "Crew: " + ship[currentSortBy];
                break;
            case "batt":
                shipImg.title = "Battery: " + ship[currentSortBy];
                break;
            case "value":
                shipImg.title = "Point Value: " + ship[currentSortBy];
                break;
            case "random":
                shipImg.title = "Random Index: " + ship[currentSortBy];
                break;
            default:
                shipImg.title = "";
                console.log("unknown sort by: " + currentSortBy + ". -sincerely, the hover text guys");
        }
    }
}
// make each button call sortBy w corresponding value
// (click instead of change, so you can repeatedly shuffle)
sortByButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (e.target.checked) {
            // when Random clicked, assign new random indices
            if (e.target.value == "random") {shuffle()};
            // then re-sort
            sortBy(e.target.value);
        }
    })
});

// get size radio buttons
const sizeButtons = document.querySelectorAll('input[name="size"]');
// function for changing size css variable
function sizeChange(value) {
    const r = document.querySelector(':root');
    // fit or number?
    switch (value) {
        case "fit":
            // fit: add class "fit"
            document.getElementById("ships-box").classList.add("fit");
            break;
        default:
            // number: set pixel size variable, clear fit
            document.getElementById("ships-box").classList.remove("fit");
            r.style.setProperty('--pixel-size', value + 'px');
    }

}
// make each radio button call sizeChange w corresponding value
sizeButtons.forEach(button => {
    button.addEventListener('change', (e) => {
        if (e.target.checked) {
            sizeChange(e.target.value);
        }
    })
});

// get order radio buttons
const orderButtons = document.querySelectorAll('input[name="order"]');
// make each radio button set order to corresponding value
orderButtons.forEach(button => {
    button.addEventListener('change', (e) => {
        if (e.target.checked) {
            order = e.target.value;
            sortBy(currentSortBy);
        }
    })
});




// press F to show/hide experimental "fit" option
document.addEventListener("keydown", (e) => {
    if (e.code == "KeyF") {
        const fitOption = document.getElementById("fit-option");

        if (fitOption.style.display != "inline") {
            fitOption.style.display = "inline";
        } else if (fitOption.style.display == "inline") {
            fitOption.style.display = "none";
        }
    }
});

// shuffle ships anew (only when random clicked.)
function shuffle() {
    for (ship of ships) {
        // 0-99
        ship.random = Math.floor(100 * Math.random());
    }
}