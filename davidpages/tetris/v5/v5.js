// get canvas drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// game constants ------------------------------------------------------------------

// grid dimensions
const gridWidth = 10;
const gridHeight = 20;

// grid block px size
const blockSize = 10;

// tetrominos
const sTetronimo = [
  [0,1],
  [0,0],
  [1,0],
  [1,-1]
]


// https://www.viget.com/articles/time-based-animation
// core: handles frames. -----------------------------------------------------------
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
    game.update(core.delta);
  },

  render: function() {
    game.draw();
  }
};

// game: handles everything in tetris logic. thinks in game steps.------------------
const game = {
  turn: 0,
  grid: [],


  firstTimeSetup() {



  },

  setupGrid() {
    for (let i = 0; i < 20; i++) {
      const row = []; // Create a temporary row
      for (let j = 0; j < 10; j++) {
      row.push(Math.random());
      }
      this.grid.push(row);
    }
  },

  startGame() {

  },

  update(delta) {
    game.step();
  },

  draw() {
    // clean the slate
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // fill screen slowly

    const img = new Image();
    // img.src = "paul-with-stick.jpg";
    // img.src = "checkerboard.jpg";
    // ctx.fillStyle = ctx.createPattern(img, "repeat");
    
    // ctx.fillRect(- this.turn / 2 % 400, 0, 500, this.turn);

    this.drawTestGraphics();
  },

  drawTestGraphics() {
    
    // draw grid
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {


        if (this.grid[i][j] > (this.turn % 1000) / 1000) {
          ctx.fillStyle = `rgb(${this.turn % 256}, ${this.turn % 119}, ${this.turn % 603})`;
          ctx.fillRect(50*j, 50*i, 50, 50);
        } else {
          ctx.fillStyle = `rgb(
          ${Math.floor(233 - 12.5 * i)}
          ${Math.floor(250 - 30.5 * j)}
          ${Math.floor(0 + 30.5 * j)})`;
          ctx.fillRect(50*j, 50*i, 50, 50);
        }


        
        // if (this.grid[i][j] > 0.5) {
        //   ctx.fillStyle = "blue";
        //   ctx.fillRect(50*i, 50*j, 50, 50);
        // } else {
        //   ctx.fillStyle = `rgb(
        //   ${Math.floor(233 - 12.5 * i)}
        //   ${Math.floor(250 - 30.5 * j)}
        //   ${Math.floor(0 + 30.5 * j)})`;
        //   ctx.fillRect(50*j, 50*i, 50, 50);
        // }
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

    // moving rectangle
    ctx.fillRect(this.turn % canvas.width, 20, 30, 40);
    ctx.fillRect(30, 60, 40, 400);

    //text
    ctx.font = "48px sans-serif";
    ctx.fillText(this.turn, 90, 200);
  },

  step() {
    this.turn += 1;

    // move shape down, freeze, score, etc
  }
};




// load stuff..

// Setup grid
game.setupGrid();

// start game loop
core.frame();


