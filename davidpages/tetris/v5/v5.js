// get canvas drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// #region GAME CONSTANTS ---------------------------------------------
// grid dimensions
const COLS = 10;
const ROWS = 20;

// grid block px size
const CELL_SIZE = 50;

// enforce grid size
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

// step time in seconds
// ~~note: not so constant~~
let STEP_TIME = 0.5;

// key repeat delays ~~~
let LEFT_RIGHT_INITIAL_DELAY = 0.2;
let LEFT_RIGHT_REPEAT_DELAY = 0.08;
let DOWN_INITIAL_DELAY = 0.05;
let DOWN_REPEAT_DELAY = 0.05;

// #endregion

// #region TETRONIMOS -------------------------------------------------
const sTetronimo = [
  [1,-1],
  [0,-1],
  [0,0],
  [-1,0]
]
const zTetronimo = [
  [-1,-1],
  [0,-1],
  [0,0],
  [1,0]
]
const lTetronimo = [
  [-1,0],
  [0,0],
  [1,0],
  [1,-1]
]
const jTetronimo = [
  [-1,-1],
  [-1,0],
  [0,0],
  [1,0]
]
const tTetronimo = [
  [0,-1],
  [-1,0],
  [0,0],
  [1,0]
]
const iTetronimo = [
  [-1,0],
  [0,0],
  [1,0],
  [2,0],
]
const oTetronimo = [
  [0,-1],
  [1,-1],
  [0,0],
  [1,0]
]
// #endregion

// #region OFFSET DATA ------------------------------------------------
// using pure "guideline srs." https://harddrop.com/wiki/SRS
// perhaps i will do an insane homebrew rotation system later
// but maybe ive had my fun with that..

// offsetData > tetronimo name > state > offset list > particular offset x,y
// note: negative Y is up for me, so Y values are flipped compared to the wiki table.
const offsetData = {
  init() {
    // for JLSTZ
    const normalOffsetData = [
      [[0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
      [[0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    ];
    this.j = normalOffsetData;
    this.l = normalOffsetData;
    this.s = normalOffsetData;
    this.t = normalOffsetData;
    this.z = normalOffsetData;
    // for I
    const iOffsetData = [
      [[0,0], [-1,0], [2,0], [-1,0], [2,0]],
      [[-1,0], [0,0], [0,0], [0,-1], [0,2]],
      [[-1,-1], [1,-1], [-2,-1], [1,0], [-2,0]],
      [[0,-1], [0,-1], [0,-1], [0,1], [0,-2]],
    ];
    this.i = iOffsetData;
    // for O
    const oOffsetData = [
      [[0,0]],
      [[0,1]],
      [[-1,1]],
      [[-1,0]],
    ];
    this.o = oOffsetData;
  }
}
offsetData.init();

// #endregion

// #region KEYS -------------------------------------------------------
// keys: keeps track of key presses
// has properties for all relevant keys, toggles them with keyup/keydown listeners
// todo to see if a key was just presesd
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  KeyC: false,
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

// #region KEY REPEAT TIMERS ------------------------------------------
class keyRepeatTimer {
  constructor(callback, initialDelay, repeatDelay) {
    this.callback = callback;
    this.initialDelay = initialDelay;
    this.repeatDelay = repeatDelay;

    this.off();
  }

  off() {
    this.timer = 0;
    this.state = "off";
  }

  start() {
    this.timer = 0;
    this.state = "initial";
  }

  update(delta) {
    switch(this.state) {
      case "off":
        // OFF: do nothing
        break;
      case "initial":
        // INITIAL: timer. check (activate&reset)
        this.timer += delta;
        if (this.timer >= this.initialDelay) {
          // callback
          this.callback();
          // reset timer
          this.timer = 0;
          // switch to repeating mode
          this.state = "repeat";
        }
        break;
      case "repeat":
        // REPEAT: timer. check (activate&reset)
        this.timer += delta;
        if (this.timer >= this.repeatDelay) {
          // callback
          this.callback();
          // reset timer
          this.timer = 0;
          // stay in "repeat" mode
        }
        break;
      default:
        console.error("unknown keyRepeatTimer state: " + this.state);
    }
  }
}
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
// edit: nah it handles timers
const game = {
  // number of elapsed game steps
  turn: 0,
  // 2d array holding game grid. 0=empty, 1=filled
  grid: [],
  // timer for game steps
  stepTimer: 0,
  // i will handle key repeat thank you
  keyRepeatTimer: 0,
  // track the name and rotation state of current tetronimo
  activeTetronimo: null,
  activeState: null,
  // list of all the current piece's blocks, relative from activeCenter
  activeMinoes: [],
  // location of current active piece's "center"
  activeCenter: [],
  // bitwise guys to track keys being pressed
  currentKeysPressed: 0,
  pastKeysPressed: 0,
  keyFlags: {
    ArrowLeft:  1<<0,
    ArrowRight: 1<<1,
    ArrowDown:  1<<2,
    ArrowUp:    1<<3,
    Space:      1<<4,
    KeyC:       1<<5,
  },
  // key repeat timers
  leftKeyRepeatTimer: null,
  rightKeyRepeatTimer: null,
  downKeyRepeatTimer: null,
  
  // GAME MODE------------------------------------
  // =============================================

  ////modefsdfsdfsd mode edsfsdf
  //
  //
  //
  //
  //

  mode: 2,
  // mode: normal,


  firstTimeSetup() {

    // FIRST CHECK MODE AND SET CONSTANTS
    console.log("mode " + game.mode);

    if (game.mode === 0) {
      STEP_TIME = (3/4);
      LEFT_RIGHT_INITIAL_DELAY = 0.2;
      LEFT_RIGHT_REPEAT_DELAY = 0.05;
      DOWN_INITIAL_DELAY = 0.2;
      DOWN_REPEAT_DELAY = 0.05;
    }
    if (game.mode === 1) {
      DOWN_INITIAL_DELAY = 1;
      // console.log(DOWN_INITIAL_DELAY);
      DOWN_REPEAT_DELAY = 0.05;
    }
    if (game.mode === 1) {
      //
    }

    // THEN MAKE KEY REPEATERS
    
    // create keyrepeat timers (now that move() exists)
    game.leftKeyRepeatTimer = new keyRepeatTimer(() => this.move(-1, 0), LEFT_RIGHT_INITIAL_DELAY, LEFT_RIGHT_REPEAT_DELAY);
    game.rightKeyRepeatTimer = new keyRepeatTimer(() => this.move(1, 0), LEFT_RIGHT_INITIAL_DELAY, LEFT_RIGHT_REPEAT_DELAY);
    game.downKeyRepeatTimer = new keyRepeatTimer(() => this.moveDown(), DOWN_INITIAL_DELAY, DOWN_REPEAT_DELAY);

    // setup first piece
    nextTetronimo();

    game.setupGrid();
  },

  setupGrid() {
    for (let i = 0; i < COLS; i++) {
      const col = []; // Create a temporary col
      for (let j = 0; j < ROWS; j++) {
        // layers past [999] filled
        if (game.mode === 7) { //7
          col.push(1);
        } else {
        col.push(0);
        }
      }
      this.grid.push(col);
    }
  },

  update(delta) {
    // controls ======================================
    // BITWISE VERSION
    // reset current
    game.currentKeysPressed = 0;
    // set current
    if (keys.ArrowLeft) {
      game.currentKeysPressed |= game.keyFlags.ArrowLeft;
      // if it was already being held:
      if (game.pastKeysPressed & game.keyFlags.ArrowLeft) {
        // update it (iterate timer, check, active, reset etc)
        game.leftKeyRepeatTimer.update(delta);
      // if it was just pressed:
      } else {
        // move todo probably move this to the timer
        game.move(-1, 0);
        // reset&start timer
        game.leftKeyRepeatTimer.start();
      }
    }
    if (keys.ArrowRight) {
      game.currentKeysPressed |= game.keyFlags.ArrowRight;
      // if it was already being held:
      if (game.pastKeysPressed & game.keyFlags.ArrowRight) {
        // update it (iterate timer, check, active, reset etc)
        game.rightKeyRepeatTimer.update(delta);
      // if it was just pressed:
      } else {
        // move todo probably move this to the timer
        game.move(1, 0);
        // reset&start timer
        game.rightKeyRepeatTimer.start();
      }
    }
    if (keys.ArrowDown) {
      game.currentKeysPressed |= game.keyFlags.ArrowDown;
      // if it was already being held:
      if (game.pastKeysPressed & game.keyFlags.ArrowDown) {
        // update it (iterate timer, check, active, reset etc)
        game.downKeyRepeatTimer.update(delta);
      // if it was just pressed:
      } else {
        // move todo probably move this to the timer
        game.moveDown();
        // reset&start timer
        game.downKeyRepeatTimer.start();
      }
    }
    if (keys.ArrowUp) {
      game.currentKeysPressed |= game.keyFlags.ArrowUp;
      // if it was just pressed: (no keyrepeat for rotate)
      if (!(game.pastKeysPressed & game.keyFlags.ArrowUp)) {
        game.rotate();
      }
    }
    if (keys.Space) {
      game.currentKeysPressed |= game.keyFlags.Space;
      // if it was just pressed: (no keyrepeat for instant drop)
      if (!(game.pastKeysPressed & game.keyFlags.Space)) {
        game.instantDrop();
      }
    }
    if (keys.KeyC) {
      console.log("C" + game.paused);
      game.currentKeysPressed |= game.keyFlags.KeyC;
      // if it was just pressed: (no keyrepeat)
      if (!(game.pastKeysPressed & game.keyFlags.KeyC)) {
        game.paused = !game.paused;
        console.log("paused: " + game.paused);
      }
    }

    // increase stepTimer, step&reset if time =========
    // ONLY IF NOT PAUSED
    if (!game.paused) {
      game.stepTimer += delta;
      if (game.stepTimer >= STEP_TIME) {
        // for now moveDown() in step is handling resetting steptimer
        // game.stepTimer -= STEP_TIME;
        game.step();
      }
    }


    // move old current to past for next frame ========
    game.pastKeysPressed = game.currentKeysPressed;

  },

  draw() {
    // clean the slate
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // fill screen slowly

    // const img = new Image();
    // // img.src = "paul-with-stick.jpg";
    // img.src = "checkerboard.jpg";
    // ctx.fillStyle = ctx.createPattern(img, "repeat");
    
    // ctx.fillRect(-(this.turn * 0.2) % 400, 0, 500, this.turn * 50);

    // drawTestGraphics();

    drawModeGraphics();
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
    if (!game.moveDown()) {
      // freeze score spawn new piece etc

      game.freeze();

      // new active tetronimo
      nextTetronimo();
    }
  },

  rotate() {
    // list of offsets to try from current position
    const offsetList = getOffsetList(game.activeTetronimo, game.activeState);
    // console.log("rotate() offsetlist: " + offsetList[0]);/////////////////
    // 1 clockwise turn
    const rotated = trueRotate(game.activeMinoes, -1);

    // for each offset:
    for (let offset of offsetList) {
      console.log("attempting offset: (" + offset[0] + "," + offset[1] + ")");
      // check if its valid
      const rotationValid = rotated.every((mino) => {
        const newGlobalX = game.activeCenter[0] + offset[0] + mino[0];
        const newGlobalY = game.activeCenter[1] + offset[1] + mino[1];
  
        return canMoveInto(newGlobalX, newGlobalY);
      });
  
      if (rotationValid) {
        // rotate active piece
        game.activeMinoes = rotated;
        // apply succesfful offset
  
        // console.log(offsetList[0][0]);
  
        game.activeCenter[0] += offset[0];
        game.activeCenter[1] += offset[1];
        // valid offset found. rotation happened.
        game.activeState = (game.activeState + 1) % 4;
        return true;
      }
    }
    console.log("all offset attempts failed!! rotation cancelled!");
    return false;
  },

  // attempt any rotation, return whether it succeeded
  // note: unused for now.
  rotateIfPossible(rotation) {
    const newActivePiece = trueRotate(game.activeMinoes, rotation);
    const rotationValid = newActivePiece.every((blockPos) => {
      const newGlobalX = game.activeCenter[0] + blockPos[0];
      const newGlobalY = game.activeCenter[1] + blockPos[1];
      return canMoveInto(newGlobalX, newGlobalY);
    });
    if (rotationValid) game.activeMinoes = newActivePiece;
    return rotationValid;
  },

  // move down, reset stepTImer.
  // note: freeze/score/spawn new piece logic not here, in step() rn
  // todo probably have canFreeze argument here like v4, so that
  // step/instantFall and down arrow can both use this
  moveDown() {
    // no matter if called automatically or from player input, reset step timer
    // (only if piece actually moved!)
    const moved = game.move(0, 1);
    if (moved) {
      game.stepTimer -= STEP_TIME;
      if (game.stepTimer < 0) game.stepTimer = 0;  
    }
    return moved;
  },

  instantDrop() {
    while(game.moveDown()) {}
    game.freeze();
    game.score();/////////////
    nextTetronimo();
  },

  // freeze active piece
  freeze() {
    // apply each activePiece block to game grid
    game.activeMinoes.forEach((blockPos) => {
      // get global coords for each block (active piece center + blockPos)
      const globalX = game.activeCenter[0] + blockPos[0];
      const globalY = game.activeCenter[1] + blockPos[1];

      game.grid[globalX][globalY] = 1;
    });
  },

  // attempt move along any vector, return whether it succeeded
  move(dx, dy) {
    // check new position.
    const moveValid = game.activeMinoes.every((blockPos) => {
      // get new coords for each block
      const newBlockX = blockPos[0] + dx;
      const newBlockY = blockPos[1] + dy;

      const newX = game.activeCenter[0] + newBlockX;
      const newY = game.activeCenter[1] + newBlockY;

      return canMoveInto(newX, newY);
    });

    // console.log("move valid: " + moveDownValid);/////////////

    // if the entire move is valid, MOVE
    if (moveValid) {
      // actually move it now
      // nope!
      // game.activePiece = game.activePiece.map((blockPos) => [blockPos[0] + dx, blockPos[1] + dy]);
      game.activeCenter = [game.activeCenter[0] + dx, game.activeCenter[1] + dy];
      return true;
    } else {
      return false;
      // whoever called me will worry about freezing etc
    }
  },

  scoreold() {
    // moved to MODE 2

    // scan rows
    for (let row = 0; row < game.grid[0].length; row++) {
      let rowFull = true;
      // console.log("x: " + i);
      for (let col = 0; col < game.grid.length; col++) {
        // console.log("x: " + i);
        if (!game.grid[row][col] === 1) {
          rowFull = false;
          break;
        }
      }

      // if row full clear it...
      if (rowFull) {
        for (let col = 0; col < game.grid.length; col++) {
          // console.log("x: " + i);
          game.grid[row][col] = 0;
        }
      }

    }
  },

  // thank you ai
  score() {
    console.log("SCOREHELLOD mode:" + game.mode);







    // MODE 0 ----------------------------------------------
    // zero-g

    if (game.mode === 0) {
      // 1. Iterate through every row
      for (let row = 0; row < game.grid[0].length; row++) {
        let isRowFull = true; 
    
        // console.log("BEGIN mode 0 row check:" + row);

        // 2. Check every column in that row
        for (let col = 0; col < game.grid.length; col++) {
          if (game.grid[col][row] === 0) { // If we find an empty space (0)
            console.log(col + "," + row);
            isRowFull = false;
            break; 
          }
        }
        console.log("row " + row + " FULL???:" + isRowFull);
  
        // 3. If the loop finished and isRowFull is still true, clear it!
        if (isRowFull) {
          for (let x = 0; x < game.grid.length; x++) {
            game.grid[x][row] = 0;
          }
        }
      }
    }


    // MODE 1 ---------------------------------------------
    // broken rn

    if (game.mode === 1) {
      // "new ai version"
      for (let row = game.grid.length - 1; row >= 0; row--) {
        if (game.grid[row].every(cell => cell === 1)) {
          game.grid.splice(row, 1);
          game.grid.unshift(new Array(game.grid[0].length).fill(0));
          row++; // Offset the loop index because we just moved rows
        }
      }
    }





    // MODE 2 ---------------------------------------------
    //normal
    if (game.mode === 2) {

      // hold on


      // console.log("mode 2 here. game grid:");//////////////////////
      // console.log(game.grid);//////////////////////
      // // scan rows
      // for (let row = 0; row < game.grid[0].length; row++) {
      //   // console.log("gamegrid[0]length: " + game.grid[0].length);
      //   let rowFull = true;
      //   // console.log("x: " + i);
      //   for (let col = 0; col < game.grid.length; col++) {
      //     console.log("x" + col + " y" + row + ": " + game.grid[row][col]);///////////////////
      //     if (!game.grid[row][col] === 1) {
      //       rowFull = false;
      //       break;
      //     }
      //   }
  
      //   // if row full clear it...
      //   if (rowFull) {
      //     for (let col = 0; col < game.grid.length; col++) {
      //       // console.log("x: " + i);
      //       game.grid[row][col] = 0;
      //     }
      //   }
      // }







      // ai fix for row cols finaally?
      if (game.mode === 2) {
        const numCols = game.grid.length;
        const numRows = game.grid[0].length;
    
        // Scan rows from bottom to top (prevents skipping rows when shifting)
        for (let row = numRows - 1; row >= 0; row--) {
          let rowFull = true;
    
          // Check every column at this row index
          for (let col = 0; col < numCols; col++) {
            // FIX: access as [col][row]
            if (game.grid[col][row] !== 1) {
              rowFull = false;
              break;
            }
          }
    
          // If row is full, clear it and move everything above down
          if (rowFull) {
            for (let col = 0; col < numCols; col++) {
              // 1. Remove the block at the current row
              game.grid[col].splice(row, 1);
              
              // 2. Add a new empty block at the very top (index 0)
              game.grid[col].unshift(0);
            }
            
            // 3. Since we shifted everything down, we need to check 
            // THIS SAME row index again because a new row just fell into it.
            row++; 
          }
        }
      }




























    }





  },

  scoreOld1() {/////////////////////////////////////
    const width = game.grid.length;
    const height = game.grid[0].length;
  
    // 1. Scan each row (Y) from bottom to top
    for (let y = height - 1; y >= 0; y--) {
      let isRowFull = true;
  
      // 2. Check every column (X) at this Y height
      for (let x = 0; x < width; x++) {
        if (game.grid[x][y] === 0) {
          isRowFull = false;
          break;
        }
      }
  
      if (isRowFull) {
        // 3. Clear the row and shift EVERYTHING above it down
        // Since it's [col][row], we must modify each column individually
        for (let x = 0; x < width; x++) {
          // Remove the element at the current Y position
          game.grid[x].splice(y, 1);
          
          // Add a 0 at the top (index 0) of this column
          game.grid[x].unshift(0);
        }
  
        // 4. Because everything shifted down, we need to check 
        // this SAME 'y' index again in the next iteration.
        y++; 
      }
    }
  }
};
// #endregion

// #region PAUSE OFF-TAB ----------------------------------------------
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


  
  if (game.mode === 0) {
    // rainbow style
    ctx.fillStyle = "black";
    // for each block in active piece
    game.activeMinoes.forEach((coords) => {
      ctx.fillRect(50*(game.activeCenter[0]+coords[0]), 50*(game.activeCenter[1]+coords[1]), 50, 50);
    });
  }
  if (game.mode === 1) {
    // rainbow style
    ctx.fillStyle = "red";
    // for each block in active piece
    game.activeMinoes.forEach((coords) => {
      ctx.fillRect(50*(game.activeCenter[0]+coords[0]), 50*(game.activeCenter[1]+coords[1]), 50, 50);
    });
  }
  if (game.mode === 2) {
    // rainbow style
    ctx.fillStyle = "aquamarine";
    // for each block in active piece
    game.activeMinoes.forEach((coords) => {
      ctx.fillRect(50*(game.activeCenter[0]+coords[0]), 50*(game.activeCenter[1]+coords[1]), 50, 50);
    });
  }
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

function drawModeGraphics() {
  // GRID
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {

      // MODE 0 --------------------------------------------
      if (game.mode === 0) {
        // rainbow bg
        // ctx.fillStyle = `rgb()`;
        ctx.fillRect(50*i, 50*j, 50, 50);


        // filled: white
        if (game.grid[i][j] > (game.turn % 1000) / 1000) {
          console.log((game.turn % 1000) / 1000);
          // ctx.fillStyle = `rgb(${game.turn % 256}, ${game.turn % 119}, ${game.turn % 603})`;
          ctx.fillStyle = "silver";
          // ctx.fillRect(50*i, 50*j, 50, 50);

          // dont reset color here for cool subtle glitchy bg color filter

          // fill...... circle???
          const radius = CELL_SIZE / 2;
          // const radius = 10; ////////

          // Target top-left corner
          const topLeftX = i * CELL_SIZE;
          const topLeftY = j * CELL_SIZE;

          // Calculate center
          const centerX = 50*i + radius;
          const centerY = 50*j + radius;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = "white"; // Or use your gradient variable here
          ctx.fill();
          ctx.closePath();

        // empty: rainbow
        } else {
          ctx.fillStyle = `rgb(
          ${Math.floor(233 - 12.5 * i)}
          ${Math.floor(250 - 10.5 * j)}
          ${Math.floor(0 + 30.5 * j)})`;

          ctx.fillRect(50*i, 50*j, 50, 50);



  
          // ctx.(50*i, 50*j, 50, 50);
        }
      }

      // MODE 2 --------------------------------------------
      if (game.mode === 2) {

        ctx.fillStyle = `gray`;
        ctx.fillRect(50*i, 50*j, 50, 50);


        // filled
        if (game.grid[i][j] > (game.turn % 1000) / 1000) {
          console.log((game.turn % 1000) / 1000);
          // ctx.fillStyle = `rgb(${game.turn % 256}, ${game.turn % 119}, ${game.turn % 603})`;
          ctx.fillStyle = "orange";
          ctx.fillRect(50*i, 50*j, 50, 50);
        // empty
        } else {
          ctx.fillStyle = "black";

          //gradient
          // 1. Create the gradient (x0, y0, x1, y1)
          // Define it from y=0 to y=height
          const gradient = ctx.createLinearGradient(0, 0, 0, ROWS * CELL_SIZE);

          // 2. Add color stops
          gradient.addColorStop(0, 'blue');   // Top color
          gradient.addColorStop(1, 'green');  // Bottom color

          // 3. Apply to fillStyle
          ctx.fillStyle = gradient;
  
          ctx.fillRect(50*i, 50*j, 50, 50);
        }
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
  // ctx.fillStyle = "lime";
  // ctx.fillRect(50*2, 50*4, 50, 50);

  // // RANDOM SKOG
  // ctx.fillStyle = "black"
  // ctx.beginPath(); // Good practice to wrap lines in paths
  // ctx.moveTo(0, 0);
  // ctx.lineTo(200, 100);
  // ctx.stroke();
  // // moving rectangle
  // ctx.fillRect(game.turn % canvas.width, 20, 30, 40);
  // ctx.fillRect(30, 60, 40, 400);
  // // text
  // ctx.font = "48px sans-serif";
  // ctx.fillText(game.turn, 90, 200);

}

function drawTestGraphics() {
  // GRID
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {


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
//true counterclockwise mathematical rotation (copied from v4)
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
  if (x >= COLS) return false;
  if (y < 0) return false;
  if (y >= ROWS) return false;
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

function getTetronimoBlueprint(tetronimo) {
  switch(tetronimo) {
    case "j":
      return jTetronimo;
    case "l":
      return lTetronimo;
    case "s":
      return sTetronimo;
    case "z":
      return zTetronimo;
    case "t":
      return tTetronimo;
    case "i":
      return iTetronimo;
    case "o":
      return oTetronimo;
    default:
      console.error("HUHS????");
  }
}

function randomTetronimoName() {
  switch(Math.floor(Math.random() * 7)) {
    case 0:
      return "j";
    case 1:
      return "l";
    case 2:
      return "s";
    case 3:
      return "z";
    case 4:
      return "t";
    case 5:
      return "i";
    case 6:
      return "o";
    default:
      console.error("HUHS????");
  }
}

// get array of offsets for a given tetronimo, in a given state, for clockwise turn
// note: for now, only clockwise rotation allowed
// tetronimoes: jlsztio
// states: 0=0, 1=R, 2=2, 3=L (ie number of clockwise rotations)
function getOffsetList(tetronimo, state) {
  // fail if tetronimo or state is invalid
  if (!offsetData.hasOwnProperty(tetronimo)) console.error("unknown tetronimo: " + tetronimo);
  if (state < 0 || state > 3) console.error("unknown rotation state: " + state);

  const currentOffsetList = [];
  // build offset list for CURRENT state;
  offsetData[tetronimo][state].forEach((offset) => {
    currentOffsetList.push(offset);
  });

  // then build nextOffsetList for NEXT state
  const nextState = (state + 1) % 4;
  const nextOffsetList = [];
  // build offset list from CURRENT state offset data;
  offsetData[tetronimo][nextState].forEach((offset) => {
    nextOffsetList.push(offset);
  });

  // then combine them into new array for clarity (current - next)
  const finalOffsetList = [];
  for (let i in currentOffsetList) {
    const finalOffset = [];
    // current - next
    finalOffset.push(currentOffsetList[i][0] - nextOffsetList[i][0]);
    finalOffset.push(currentOffsetList[i][1] - nextOffsetList[i][1]);
    // next - current
    // finalOffset.push(nextOffsetList[i][0] - currentOffsetList[i][0]);
    // finalOffset.push(nextOffsetList[i][1] - currentOffsetList[i][1]);
    finalOffsetList.push(finalOffset);
  }

  // console.log(currentOffsetList);
  // console.log(nextOffsetList);//////////
  // console.log(finalOffsetList);


  // console.log(offsetList);
  return finalOffsetList;
}

function nextTetronimo() {

  // get random tetronimo name, remember it
  const startingTetronimo = randomTetronimoName();
  // const startingTetronimo = "i"; //DEBUG: all squares
  game.activeTetronimo = startingTetronimo;

  // start in state 0
  game.activeState = 0;
  // copy blueprint into activeMinoes
  game.activeMinoes = structuredClone(getTetronimoBlueprint(startingTetronimo));
  // spawn in the middle
  game.activeCenter = [Math.floor(COLS / 2), 1];
}
// #endregion








// load stuff..

// Setup grid
game.firstTimeSetup();

// start game loop
core.frame();


