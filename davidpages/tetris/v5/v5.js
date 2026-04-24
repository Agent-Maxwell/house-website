// const canvas = document.getElementById("v5-canvas");
// var ctx = c.getContext("2d");




// const canvas = document.getElementById("v5-canvas");
// var ctx = canvas.getContext("2d");
// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();

// const game = {
//     turn: 0,

//     draw() {
//         ctx.fillRect(this.turn, 20, 30, 40);
//         ctx.fillRect(30, 60, 40, 400);
//     },

//     step() {
//         this.turn += 1;
//     }
// };

// game.draw();

// window.requestAnimationFrame(game.step);











//more copupastes
const core = {
 frame: function() {
 core.setDelta();
 core.update();
 core.render();
 core.animationFrame = window.requestAnimationFrame(core.frame);
 },

 setDelta: function() {
 core.now = Date.now();
 core.delta = (core.now - core.then) / 1000; // seconds since last frame
 core.then = core.now;
 },

 update: function() {
 // Update values
 // var distance = 100 * core.delta;
 // thing.x += distance;
 },

 render: function() {
 // Render updates to browser (draw to canvas, update css, etc.)
 }
};


core.frame();







// thanks ai <33
const canvas = document.getElementById("v5-canvas");
var ctx = canvas.getContext("2d");

class Block {
  constructor(value) {
    this.value = value;
  }
}

const game = {
    turn: 0,
    grid: [],



setup() {
    for (let i = 0; i < 20; i++) {
        const row = []; // Create a temporary row
        for (let j = 0; j < 10; j++) { // Use 'j' here
            row.push(new Block(Math.random()));
        }
        this.grid.push(row);
    }
},

    draw() {
        // Clear the canvas so we don't leave a "trail"
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw grid
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.grid[i][j].value > 0.5) {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(50*i, 50*j, 50, 50);
                } else {
                    ctx.fillStyle = `rgb(
                        ${Math.floor(233 - 42.5 * i)}
                        ${Math.floor(250 - 30.5 * j)}
                        ${Math.floor(0 + 30.5 * j)})`;
                    ctx.fillRect(50*j, 50*i, 50, 50);
                }
            }
        }
        
        // DEAD PIXEL
        ctx.fillStyle = "lime";
        ctx.fillRect(50*2, 50*4, 50, 50);

        
        // draw random shit
        // Draw your lines/rectangles
        ctx.fillStyle = "black"
        ctx.beginPath(); // Good practice to wrap lines in paths
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 100);
        ctx.stroke();

        ctx.fillRect(this.turn % canvas.width, 20, 30, 40);
        ctx.fillRect(30, 60, 40, 400);

    },

    step() {
        this.turn += 1;
        this.draw();
        
        // Use an arrow function to keep 'this' pointing to 'game'
        // and call it again to create the loop
        window.requestAnimationFrame(() => this.step());
    }
};

// Setup grid
game.setup();

console.log(game.grid);
// Start the loop
game.step();