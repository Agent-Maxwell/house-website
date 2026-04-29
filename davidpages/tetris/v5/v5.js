// get canvas drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// #region GAME CONSTANTS ---------------------------------------------
// grid dimensions
const gridWidth = 10;
const gridHeight = 20;

// grid block px size
const blockSize = 50;

// enforce grid size
canvas.width = gridWidth * blockSize;
canvas.height = gridHeight * blockSize;

// #region TETRONIMOS
const sTetronimo = [
  [0,-1],
  [0,0],
  [1,0],
  [1,1]
]
const zTetronimo = [
  [0,1],
  [0,0],
  [1,0],
  [1,-1]
]
const lTetronimo = [
  [0,-1],
  [0,0],
  [0,1],
  [1,1]
]
const jTetronimo = [
  [0,-1],
  [0,0],
  [0,1],
  [-1,1]
]
const tTetronimo = [
  [-1,0],
  [0,0],
  [1,0],
  [0,-1]
]
const iTetronimo = [
  [0,-1],
  [0,0],
  [0,1],
  [0,2]
]
const oTetronimo = [
  [0,-1],
  [0,0],
  [1,-1],
  [1,0]
]
// #endregion

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
  Space: false,

  // these are just set once and reset by Game
  // note: keyrepeat happens w this strategy. todo
  ArrowUpJustPressed: false,
  ArrowDownJustPressed: false,
  ArrowLeftJustPressed: false,
  ArrowRightJustPressed: false,
  SpaceJustPressed: false
};
window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        keys[e.code + "JustPressed"] = true;
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
    core.then = performance.now();
  },

  frame() {
    core.setDelta();
    core.update();
    core.render();
    core.animationFrame = window.requestAnimationFrame(core.frame);
  },

  setDelta() {
    core.now = performance.now();
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
  // number of elapsed game steps
  turn: 0,
  // 2d array holding game grid. 0=empty, 1=filled
  grid: [],
  // timer for game steps
  stepTimer: 0,
  // list of all the current piece's blocks, relative from currentLocation
  activePiece: [],
  // location of current active piece's "center"
  activeCenter: [],

  firstTimeSetup() {
    // copy sTetronimo blueprint into active piece array
    game.activePiece = structuredClone(randomTetronimoBlueprint());
    game.activeCenter = [Math.floor(gridWidth / 2), 1];
    game.setupGrid();
  },

  setupGrid() {
    for (let i = 0; i < gridWidth; i++) {
      const col = []; // Create a temporary col
      for (let j = 0; j < gridHeight; j++) {
        // layers past [999] filled
        if (j > 999) {
          col.push(1);
        } else {
        col.push(0);
        }
      }
      this.grid.push(col);
    }
  },

  update(delta) {
    // increase stepTimer, step&reset if time

    game.stepTimer += delta;
    if (game.stepTimer >= stepTime) {
      game.stepTimer -= stepTime;
      game.step();
    }



    // controls -----------------
    if (keys.ArrowLeftJustPressed) {
      game.move(-1, 0);
      keys.ArrowLeftJustPressed = false;
    }
    if (keys.ArrowRightJustPressed) {
      game.move(1, 0);
      keys.ArrowRightJustPressed = false;
    }
    if (keys.ArrowUpJustPressed) {
      // game.move(0, -1); // lol
      keys.ArrowUpJustPressed = false;

      game.activePiece = trueRotate(game.activePiece, 1);
    }
    if (keys.ArrowDownJustPressed) {
      game.move(0, 1);
      keys.ArrowDownJustPressed = false;
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
    // drawCube();

    // draw "next" location
    // drawTetronimo(game.currentLocation[0], game.currentLocation[1] + 1);
    // draw current
    drawActivePiece();
  },

  step() {
    game.turn += 1;

    // console.log("activepieec:" + game.activePiece);//////////
    // console.log("activecenter:" + game.activeCenter);////////////

    // if move down fails:
    if (!game.move(0, 1)) {
      // freeze score spawn new piece etc

      // apply each activePiece block to game grid
      game.activePiece.forEach((blockPos) => {
        // get global coords for each block (active piece center + blockPos)
        const globalX = game.activeCenter[0] + blockPos[0];
        const globalY = game.activeCenter[1] + blockPos[1];

        game.grid[globalX][globalY] = 1;
      });

      // get new S tetronimo
      game.activePiece = structuredClone(randomTetronimoBlueprint());
      
      // reset activ epiece  location
      game.activeCenter = [Math.floor(gridWidth / 2), 1];

    }
  },

  // attempt move along any vector, return whether it succeeded
  move(dx, dy) {
    // check new position.
    const moveDownValid = game.activePiece.every((blockPos) => {
      // get new coords for each block
      const newBlockX = blockPos[0] + dx;
      const newBlockY = blockPos[1] + dy;

      const newX = game.activeCenter[0] + newBlockX;
      const newY = game.activeCenter[1] + newBlockY;

      return canMoveInto(newX, newY);
    });

    // console.log("move valid: " + moveDownValid);/////////////

    // if the entire move is valid, MOVE
    if (moveDownValid) {
      // actually move it now
      // nope!
      // game.activePiece = game.activePiece.map((blockPos) => [blockPos[0] + dx, blockPos[1] + dy]);
      game.activeCenter = [game.activeCenter[0] + dx, game.activeCenter[1] + dy];
      return true;
    } else {
      return false;
      // whoever called me will worry about freezing etc
    }
  }
};
// #endregion

// #region PAUSE OFF-TAB ------------------------------------------------------
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // game.paused = true;
  } else {
    // reset delta to prevent catchup
    core.then = performance.now();
    // game.paused = false;
  }
});
// #endregion

// #region DRAWING STUFF ----------------------------------------------
function drawActivePiece() {
  // rainbow style
  ctx.fillStyle = "blue";
  // for each block in active piece
  game.activePiece.forEach((coords) => {
    ctx.fillRect(50*(game.activeCenter[0]+coords[0]), 50*(game.activeCenter[1]+coords[1]), 50, 50);
  });
}

function drawCube() {
  ctx.strokeStyle = "lime";
  ctx.strokeRect(100, 100, 100, 100);
  
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(120, 120);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(200, 100);
  ctx.lineTo(180, 120);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.lineTo(120, 180);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(180, 180);
  ctx.stroke();

  ctx.strokeRect(120, 120, 60, 60);
}

function drawTestGraphics() {
  // GRID
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {


      if (game.grid[i][j] > (game.turn % 1000) / 1000) {
        ctx.fillStyle = `rgb(${game.turn % 256}, ${game.turn % 119}, ${game.turn % 603})`;
        ctx.fillRect(50*i, 50*j, 50, 50);
      } else {
        ctx.fillStyle = `rgb(
        ${Math.floor(233 - 12.5 * i)}
        ${Math.floor(250 - 10.5 * j)}
        ${Math.floor(0 + 30.5 * j)})`;
        ctx.fillRect(50*i, 50*j, 50, 50);

        // ctx.strokeStyle = "black";
        // ctx.strokeRect(50*i, 50*j, 50, 50);
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
    for (let i = 0; i < unRotated.length; i++) { //rotate X and Y values
        //console.log("loop i = " + i)
        //console.log("unRotated[0] length: " + unRotated[0].length);
        let originalX = unRotated[i][0];
        let originalY = unRotated[i][1];
        //console.log("unRotated[" + i + "][0]: " + unRotated[i][0]);//debug: print og x
        //console.log("unRotated[" + i + "][0]: " + unRotated[i][0]);//debug: print og y
        // NOTE: the "-rotation" is to convert amount of positive clockwise rotations into the factor to multiply the counterclockwise PI/2 rotation by
        let rotatedX = Math.round(originalX * Math.cos(-rotation * Math.PI / 2) - originalY * Math.sin(-rotation * (Math.PI / 2)));
        let rotatedY = Math.round(originalX * Math.sin(-rotation * Math.PI / 2) + originalY * Math.cos(-rotation * (Math.PI / 2)));
        rotated.push([rotatedX, rotatedY]);
        //console.log(rotatedX + " " + rotatedY)
    }

    //console.log("loop ended, rotated length: " + rotated.length)

    //console.log("pre-rotation: " + unRotated)
    //console.log("post-rotation: " + rotated)

    return rotated;
}

// checks if coords are onscreen
function isOnscreen(x, y) {
  // console.log("isOnscreen(" + x + "," + y + ")");///////////////
  if (x < 0) return false;
  if (x >= gridWidth) return false;
  if (y < 0) return false;
  if (y >= gridHeight) return false;
  return true;
}

// checks if coords are empty
function isEmpty(x, y) {
  // console.log("isEmpty(" + x + "," + y + ")");///////////////
  return game.grid[x][y] === 0;
}

// just onscreen + empty
function canMoveInto(x, y) {
  // console.log("canMoveInto(" + x + "," + y + ")");///////////////
  return isOnscreen(x, y) && isEmpty(x, y);
}

function randomTetronimoBlueprint() {
  switch(Math.floor(Math.random() * 7)) {
    case 0:
      return sTetronimo;
    case 1:
      return zTetronimo;
    case 2:
      return lTetronimo;
    case 3:
      return jTetronimo;
    case 4:
      return tTetronimo;
    case 5:
      return iTetronimo;
    case 6:
      return oTetronimo;
    default:
      console.error("HUHS????");
  }
}
// #endregion




// load stuff..

// Setup grid
game.firstTimeSetup();

// start game loop
core.frame();


