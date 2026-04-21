const ships = [
    {
        nameOrder: 1,
        name: "Androsynth",
        crew: 20,
        batt: 24,
        score: 15,
    },
    {
        nameOrder: 2,
        name: "Arilou",
        crew: 6,
        batt: 20,
        score: 16,
    },
    {
        nameOrder: 3,
        name: "Chenjesu",
        crew: 36,
        batt: 30,
        score: 28,
    },
    {
        nameOrder: 4,
        name: "Chmmr",
        crew: 42,
        batt: 42,
        score: 30,
    },
    {
        nameOrder: 5,
        name: "Druuge",
        crew: 14,
        batt: 32,
        score: 17,
    },
    {
        nameOrder: 6,
        name: "Earthling",
        crew: 18,
        batt: 18,
        score: 11,
    },
    {
        nameOrder: 7,
        name: "Ilwrath",
        crew: 22,
        batt: 16,
        score: 10,
    },
    {
        nameOrder: 8,
        name: "Kohr-Ah",
        crew: 42,
        batt: 42,
        score: 30,
    },
    {
        nameOrder: 9,
        name: "Melnorme",
        crew: 20,
        batt: 42,
        score: 18,
    },
    {
        nameOrder: 10,
        name: "Mmrnmhrm",
        crew: 20,
        batt: 10,
        score: 19,
    },
    {
        nameOrder: 11,
        name: "Mycon",
        crew: 20,
        batt: 40,
        score: 21,
    },
    {
        nameOrder: 12,
        name: "Orz",
        crew: 16,
        batt: 20,
        score: 23,
    },
    {
        nameOrder: 13,
        name: "Pkunk",
        crew: 8,
        batt: 12,
        score: 20,
    },
    {
        nameOrder: 14,
        name: "Shofixti",
        crew: 6,
        batt: 4,
        score: 5,
    },
    {
        nameOrder: 15,
        name: "Slylandro",
        crew: 12,
        batt: 20,
        score: 17,
    },
    {
        nameOrder: 16,
        name: "Spathi",
        crew: 30,
        batt: 10,
        score: 18,
    },
    {
        nameOrder: 17,
        name: "Supox",
        crew: 12,
        batt: 16,
        score: 16,
    },
    {
        nameOrder: 18,
        name: "Syreen",
        crew: 12, // syreen funny, max 42
        batt: 16,
        score: 13,
    },
    {
        nameOrder: 19,
        name: "Thraddash",
        crew: 8,
        batt: 24,
        score: 10,
    },
    {
        nameOrder: 20,
        name: "Umgah",
        crew: 10,
        batt: 30,
        score: 7,
    },
    {
        nameOrder: 21,
        name: "Ur-Quan",
        crew: 42,
        batt: 42,
        score: 30,
    },
    {
        nameOrder: 22,
        name: "Utwig",
        crew: 20,
        batt: 10, // utwig funny, max 20
        score: 22,
    },
    {
        nameOrder: 23,
        name: "Vux",
        crew: 20,
        batt: 40,
        score: 12,
    },
    {
        nameOrder: 24,
        name: "Yehat",
        crew: 20,
        batt: 10,
        score: 23,
    },
    {
        nameOrder: 25,
        name: "ZoqFot",
        crew: 10,
        batt: 10,
        score: 6,
    }
]

let order = "ascending";
let currentSortBy = "nameOrder";

// set ship img src's
for (ship of ships) {
    // Set src's
    const shipImg = document.getElementById(ship.name.toLowerCase());
    shipImg.src = "img/ship-stats/" + ship.name.toLowerCase() + ".png";

    // todo also set link href's here
}

// get sortBy radio buttons
const sortByButtons = document.querySelectorAll('input[name="sort-by"]');
// function to change ship css ordering
function sortBy(what) {
    currentSortBy = what;

    for (ship of ships) {
        const shipImg = document.getElementById(ship.name.toLowerCase());

        // NAME ORDER
        // shipImg.style.order = ship.nameOrder;
        // SCORE ORDER
        // shipImg.style.order = ship.score;
        // CREW ORDER
        // shipImg.style.order = ship.crew;
        // BATT ORDER
        // shipImg.style.order = ship.batt;

        // WHAT order

        //note: setting the order for the img's parent element, the <a>'s that are actually being ordered

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
    }
}
// make each button call sortBy w corresponding value
sortByButtons.forEach(button => {
    button.addEventListener('change', (e) => {
        if (e.target.checked) {
            sortBy(e.target.value);
        }
    })
});

// get size radio buttons
const sizeButtons = document.querySelectorAll('input[name="size"]');
// function for changing size css variable
function sizeChange(value) {
    const r = document.querySelector(':root');
    r.style.setProperty('--pixel-size', value + 'px');
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

