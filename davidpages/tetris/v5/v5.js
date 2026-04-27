// get canvas drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// #region GAME CONSTANTS ---------------------------------------------
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

// step time in seconds
const stepTime = 0.3;
// #endregion

// #region KEYS -------------------------------------------------------
// keys: keeps track of key presses
// has properties for all relevant keys, toggles them with keyup/keydown listeners
// todo to see if a key was just presesd, maybe have another set of vars
// like ArrowUpJustPressed, which the update() function resets when it registers it
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};
window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        // Prevent scrolling with arrows / space
        e.preventDefault(); 
        // console.log(e.code + "pressed");/////////
    }
});
window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});
// #endregion

// #region CORE -------------------------------------------------------
// core: handles frames.
// https://www.viget.com/articles/time-based-animation
const core = {
  init() {
    core.then = Date.now();
  },

  frame() {
    core.setDelta();
    core.update();
    core.render();
    core.animationFrame = window.requestAnimationFrame(core.frame);
  },

  setDelta() {
    core.now = Date.now();
    core.delta = (core.now - core.then) / 1000; // seconds since last frame
    core.then = core.now;
  },

  update() {
    game.update(core.delta);
  },

  render() {
    game.draw();
  }
};
core.init();
// #endregion

// #region GAME -------------------------------------------------------
// game: handles everything in tetris logic. thinks in game steps.
// edit: nah it handles its own step timer
const game = {
  turn: 0,
  grid: [],
  stepTimer: 0,
  current: [],
  currentLocation: [],

  firstTimeSetup() {
    game.current = sTetronimo;
    game.currentLocation = [gridWidth / 2, 1];
    game.setupGrid();
  },

  setupGrid() {
    for (let i = 0; i < 10; i++) {
      const col = []; // Create a temporary col
      for (let j = 0; j < 20; j++) {
        // bottom layer filled for now
        if (j > 11) {
          col.push(1);
        } else {
        col.push(0);
        }
      }
      this.grid.push(col);
    }
  },
 
  startGame() {

  },

  update(delta) {
    // increase stepTimer, step&reset if time
    game.stepTimer += delta;
    if (game.stepTimer >= stepTime) {
      game.stepTimer -= stepTime;
      game.step();
    }



    // ah yes "tetris" -----------------
    if (keys.ArrowLeft) {
      game.currentLocation[0]--;
    }
    if (keys.ArrowRight) {
      game.currentLocation[0]++;
    }
    if (keys.ArrowUp) {
      game.currentLocation[1]--;
    }
    if (keys.ArrowDown) {
      game.currentLocation[1]++;
    }
  },

  draw() {
    // clean the slate
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // fill screen slowly

    // const img = new Image();
    // img.src = "paul-with-stick.jpg";
    // img.src = "checkerboard.jpg";
    // ctx.fillStyle = ctx.createPattern(img, "repeat");
    
    // ctx.fillRect(- this.turn / 2 % 400, 0, 500, this.turn);

    drawTestGraphics();

    // draw "next" location
    // drawTetronimo(game.currentLocation[0], game.currentLocation[1] + 1);
    // draw current
    drawTetronimo(game.currentLocation[0], game.currentLocation[1]);
  },

  step() {
    game.turn += 1;
    // move current shape down
    // game.currentLocation[1]++;
    game.moveDown();

    // move shape down, freeze, score, etc
  },

  moveDown() {
    // create copy to revert to or whatever
    // const initial = game.current.map(col => [...col]);

    // attempt to move down:
    // check 1 square down from each current position.
    // if any intersect, this is true
    const moveDownIntersects = game.current.some((pos) => {
      const newX = pos[0];
      const newY = pos[1]+1;
      // >0 : square not empty (note: breaks if tetronimo is offscreen)
      
      return (game.grid[game.currentLocation[0] + newX][game.currentLocation[1] + newY] > 0);
    });

    // console.log("moveDownIntersects: " + moveDownIntersects);

    if (moveDownIntersects) {
      //freeze.. spawn new...
    } else {
      // move current down
      game.current.forEach((pos) => {
        pos[1]++;
      });
    }
  },

  moveLeft() {

  },

  moveRight() {

  },
};
// #endregion

// #region DRAWING STUFF ----------------------------------------------
function drawTetronimo(x, y) {
  // rainbow style
  ctx.fillStyle = "blue";
  // for each block in tetronimo (s for now)
  sTetronimo.forEach((coords) => {
    ctx.fillRect(50*(x+coords[0]), 50*(y+coords[1]), 50, 50);
  });
}

function drawTestGraphics() {
  // GRID
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 20; j++) {


      if (game.grid[i][j] > (game.turn % 1000) / 1000) {
        ctx.fillStyle = `rgb(${game.turn % 256}, ${game.turn % 119}, ${game.turn % 603})`;
        ctx.fillRect(50*i, 50*j, 50, 50);
      } else {
        ctx.fillStyle = `rgb(
        ${Math.floor(233 - 12.5 * i)}
        ${Math.floor(250 - 30.5 * j)}
        ${Math.floor(0 + 30.5 * j)})`;
        ctx.fillRect(50*i, 50*j, 50, 50);

        ctx.strokeStyle = "black";
        ctx.strokeRect(50*i, 50*j, 50, 50);
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
  ctx.fillRect(game.turn % canvas.width, 20, 30, 40);
  ctx.fillRect(30, 60, 40, 400);

  //text
  ctx.font = "48px sans-serif";
  ctx.fillText(game.turn, 90, 200);
}
// #endregion

// #region UTILITY FUNCS ----------------------------------------------
//true mathematical rotation (copied from v4)
function trueRotate(unRotated, rotation) {
    //rotation equations from internet:
    //x' = x * cos(PI/2) - y * sin(PI/2)
    //y' = x * sin(PI/2) + y * cos(PI/2)

    let rotated = []
    //console.log("trueRotate loop starting, going to loop " + unRotated.length + " times")
    for (i = 0; i < unRotated.length; i++) { //rotate X and Y values
        //console.log("loop i = " + i)
        //console.log("unRotated[0] length: " + unRotated[0].length);
        let originalX = unRotated[i][0]
        let originalY = unRotated[i][1]
        //console.log("unRotated[" + i + "][0]: " + unRotated[i][0]);//debug: print og x
        //console.log("unRotated[" + i + "][0]: " + unRotated[i][0]);//debug: print og y
        // NOTE: the "-rotation" is to convert amount of positive clockwise rotations into the factor to multiply the counterclockwise PI/2 rotation by
        let rotatedX = Math.round(originalX * Math.cos(-rotation * Math.PI / 2) - originalY * Math.sin(-rotation * (Math.PI / 2)))
        let rotatedY = Math.round(originalX * Math.sin(-rotation * Math.PI / 2) + originalY * Math.cos(-rotation * (Math.PI / 2)))
        rotated.push([rotatedX, rotatedY])
        //console.log(rotatedX + " " + rotatedY)
    }

    //console.log("loop ended, rotated length: " + rotated.length)

    //console.log("pre-rotation: " + unRotated)
    //console.log("post-rotation: " + rotated)

    return rotated;
}
// #endregion




// load stuff..

// Setup grid
game.firstTimeSetup();

// start game loop
core.frame();


