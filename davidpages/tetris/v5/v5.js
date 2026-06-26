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
// allow 100px space for hud stuff on the right side
canvas.width = COLS * CELL_SIZE + 100;
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

// #region BLOCK CLASS ------------------------------------------------
// class to represent a filled block on the screen, part of the active piece or not.
// contains block type, animations, location(?).
class Block {
  constructor(type) {
    // "normal" or whatever special type
    this.type = type;
    // counter to see how many clears til it disappears (default 1)
    this.stack = 1;
    // whether pieces freeze on it, cant intersect etc
    this.collision = true;
    // visual sprite
    // console.log("creatingBlock. assets.images: " + game.assets.images.mino1);
    this.sprite = game.assets.images.mino1;
    // maybe color filter

    switch (type) {
      case "air":
      this.collision = false;
      // this.sprite = game.assets.images[mino1];
      this.sprite = null;
      break;

      case "a":
      this.collision = true;
      this.sprite = game.assets.images.mino2;
      break;

      case "b":
      this.collision = true;
      this.sprite = game.assets.images.mino3;
      this.stack = 3;
      break;
    }
  }

  clear() {

  }

  toString() {
    return this.type;
  }
}
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
  // #region GAME VARS -----------------------
  // number of elapsed game steps
  turn: 0,
  // 2d array holding game grid. Block.value: 0=empty, 1=filled
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
  // timer that just counts up from first time setup (for rainbwo bg)
  timer: 0,
  score: 0,
  //todo image object, for now just img vars in game
  greenMinoImg: null,
  // #endregion
  
  // GAME MODE--------------------------------
  mode: 1,
  // 0: "finite zen." no-step, no clearing
  // 1: "normal"
  // 2: "floating"
  // 3: Block class test

  assets: {
    images: {},
    audioBuffers: {}
  },

  // for audio. not initizlied yet. todo
  audioCtx: null,

  firstTimeSetup() {
    // FIRST CHECK MODE AND SET CONSTANTS
    console.log("mode " + game.mode);

    // [MODE DEPENDENT]
    if (game.mode === 0) {
      // step time unchanged but irrelevant;
      // for mode 0, steps are just disabled in update()
      // STEP_TIME = 999;

      // left/right/down all the same timing
      LEFT_RIGHT_INITIAL_DELAY = 0.12;
      LEFT_RIGHT_REPEAT_DELAY = 0.12;
      DOWN_INITIAL_DELAY = 0.12;
      DOWN_REPEAT_DELAY = 0.12;
    }
    if (game.mode === 1) {
      // normal. no modifications
    }
    if (game.mode === 2) {
      // you get a bit more time for floating mode
      STEP_TIME = (1.11);
    }
    if (game.mode === 3) {
      //...
    }

    // THEN MAKE KEY REPEATERS
    // create keyrepeat timers (now that move() exists)
    game.leftKeyRepeatTimer = new keyRepeatTimer(() => this.move(-1, 0), LEFT_RIGHT_INITIAL_DELAY, LEFT_RIGHT_REPEAT_DELAY);
    game.rightKeyRepeatTimer = new keyRepeatTimer(() => this.move(1, 0), LEFT_RIGHT_INITIAL_DELAY, LEFT_RIGHT_REPEAT_DELAY);
    game.downKeyRepeatTimer = new keyRepeatTimer(() => this.moveDown(), DOWN_INITIAL_DELAY, DOWN_REPEAT_DELAY);

    // setup first piece
    nextTetronimo();

    game.setupGrid();

    // load mino image for rebndering todo move to "load eveything" scetion somewheer
    game.greenMino1 = new Image();
    game.greenMino2 = new Image();
    game.greenMino3 = new Image();
    //console.log(this.greenMinoImg);
    game.greenMino1.src = "../img/gren-mino-1.png";
    game.greenMino2.src = "../img/gren-mino-2.png";
    game.greenMino3.src = "../img/gren-mino-3.png";
  },

  async loadEverything() {
    console.log("loading...");
    // create the context immediately (it will start 'suspended')
    game.audioCtx = new AudioContext();

    // todo Wake up the audio on the first click
    // could just go here i guess

    // window.addEventListener('click', () => {
    //   if (audioCtx.state === 'suspended') {
    //     audioCtx.resume();
    //   }
    //   // Now playSound() will work perfectly!
    // }, { once: true });

    const imagesToLoad = {
      mino1: '../img/gren-mino-1.png',
      mino2: '../img/gren-mino-2.png',
      mino3: '../img/gren-mino-3.png',
    };

    const soundsToLoad = {
      // move: 'sounds/move.wav',
    };

    try {
      // Create arrays of Promises
      const imagePromises = Object.entries(imagesToLoad).map(([name, url]) => 
          this.loadImage(name, url)
      );

      const audioPromises = Object.entries(soundsToLoad).map(([name, url]) => 
          this.loadAudio(name, url)
      );

      // 2. The Magic Moment: Wait for every single one to resolve
      await Promise.all([...imagePromises, ...audioPromises]);

      console.log("all assets loaded!");
      // this.start(); // Launch the game loop
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  },

  loadImage(name, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // img.crossOrigin = "anonymous"; //if hosting images elswehere

      img.onload = () => {
        this.assets.images[name] = img;
        resolve(img);
      };
      img.onerror = () => reject(`failed to load img: ${url}`);
      img.src = url;
    });
  },

  async loadAudio(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // decode binary data into AudioBuffer
    const decodedData = await game.audioCtx.decodeAudioData(arrayBuffer);
    // put decoded audio in assets, ready to be played
    this.assets.audioBuffers[name] = decodedData;
    return decodedData;
  },

  // play a one-off sound from assets.audiobuffers[name]
  playSound(name) {
    if (!this.audioCtx) {
      console.log("cannot play sound " + name + "; audio context does not exist");
      return;
    }

    // source node ("needle")
    const source = game.audioCtx.createBufferSource();

    // point the needle to stored buffer ("record")
    source.buffer = game.assets.audioBuffers[name];

    // connect needle to speakers
    source.connect(game.audioCtx.destination);

    // play!
    source.start(0);
  },

  // todo use Block class in grid
  setupGrid() {
    for (let i = 0; i < COLS; i++) {
      const col = []; // Create a temporary col
      for (let j = 0; j < ROWS; j++) {
        // layers past [999] filled
        // [MODE DEPENDENT]
        if (game.mode === 7) { //7
          col.push(new Block("a"));
        } else {
        col.push(new Block("air"));
        }
      }
      this.grid.push(col);
    }
    // console.log(game.grid[0][0]);///////////////
  },

  update(delta) {
    // timer ticks up
    game.timer += delta;

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
        if (game.moveDown()) game.stepTimer = 0;
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
    // also not in mode 0 [MODE DEPENDENT]
    if (!game.paused && game.mode !== 0) {
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
    drawText(game.score);

    // drawCube();


    // draw "next" location
    // drawTetronimo(game.currentLocation[0], game.currentLocation[1] + 1);
    // draw current
    drawActivePiece();
  },

  step() {
    game.turn += 1;

    // if move down fails:
    if (!game.moveDown()) {
      game.stepTimer = 0; // reset here and in movedown(if it moves). could probably centralize timer reset.
      game.freeze();
      game.scoreCheck();
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
      // console.log("attempting offset: (" + offset[0] + "," + offset[1] + ")");////////////
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
    // console.log("movedown: " + moved);/////////////////
    return moved;
  },

  instantDrop() {
    while(game.moveDown()) {}
    game.freeze();
    game.scoreCheck();
    nextTetronimo();
  },

  // freeze active piece
  freeze() {
    // apply each activePiece block to game grid
    game.activeMinoes.forEach((blockPos) => {
      // get global coords for each block (active piece center + blockPos)
      const globalX = game.activeCenter[0] + blockPos[0];
      const globalY = game.activeCenter[1] + blockPos[1];

      // game.grid[globalX][globalY] = 1;
      game.grid[globalX][globalY] = new Block(Math.round(Math.random() * 2) ? "a" : "b");
      // console.log("freeze. grid: " + game.grid);//////////
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

  scoreCheck() {
    // [MODE DEPENDENT] mode 0: just score a point and thats it
    if (game.mode === 0) {
      game.score++;
      return;
    }

    // console.log("SCOREHELLOD mode:" + game.mode);///////

    // scan rows the same way regardless of mode, just handle
    // row clear itself differently depending on mode

    const numCols = game.grid.length;
    const numRows = game.grid[0].length;
    // for each row (bottom to top):
    for (let row = numRows - 1; row >= 0; row--) {
      // assume rowfull
      let rowFull = true;
      // set rowFull to false if any are empty
      for (let col = 0; col < numCols; col++) {
        // if (game.grid[col][row] === 0) {
        if (game.grid[col][row].type === "air") {
          rowFull = false;
          break;
        }
      }
      // console.log("row " + row + " full:" + rowFull);////////
      // if row full:
      if (rowFull) {
        // [MODE DEPENDENT] behavior on a full row:
        switch (game.mode) {
          // MODE 0: no clearing.
          case 0:
            break;
          // MODE 1: clear, grid blocks fall
          case 1:
          case 3: // todo block class test
            // scan across row
            for (let col = 0; col < numCols; col++) {
              // splice, unshift: grid blocks fall
              // remove block at this row
              game.grid[col].splice(row, 1);
              // add new empty block at top
              // game.grid[col].unshift(0);
              game.grid[col].unshift(new Block("air"));
            }
            // 1 point for row clear
            game.score++;
            // check same row again because the next one just fell into it...
            row++;
            break;
          // MODE 2: clear, grid blocks DON'T fall
          case 2:
            // scan across row
            for (let col = 0; col < numCols; col++) {
              // just set to 0
              // game.grid[col][row] = 0;
              game.grid[col][row] = new Block("air");
            }
            // 1 point for row clear
            game.score++;
            break;
        }
      }
      // console.log("scanned row " + row);////////////
    }
  },
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
function drawBlock(block, x, y) {
  // if block has a sprite, draw it
  if (block.sprite) ctx.drawImage(block.sprite, 50*x, 50*y);

  // ctx.filter = 'none'; //rreset filter
}

function drawActivePiece() {
  // [MODE DEPENDENT]
  
  if (game.mode === 0) {


    // for each block in active piece
    game.activeMinoes.forEach((coords) => {
      const minoX = game.activeCenter[0]+coords[0];
      const minoY = game.activeCenter[1]+coords[1];
      drawCircle(minoX, minoY, "black");
      // FUN: white ~~~~~~
      // drawCircle(minoX, minoY, "white");

    });
  }
  if (game.mode === 1 || game.mode === 3) {
    // red style
    ctx.fillStyle = "red";
    // for each block in active piece
    game.activeMinoes.forEach((coords) => {
      const i = game.activeCenter[0]+coords[0];
      const j = game.activeCenter[1]+coords[1];
      //ctx.fillRect(50*i, 50*j, 50, 50);
      //ctx.filter = `hue-rotate(${Math.random() * 360}deg)`;
      //ctx.filter = `hue-rotate(${i+j*10}deg)`;
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(game.greenMino2, 50*i, 50*j);
      ctx.filter = 'none'; //rreset filter
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

function drawModeGraphics() {
  // GRID
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {

      // MODE 0 --------------------------------------------
      if (game.mode === 0) {
        //BG 

        // cool effect w rainbow filled blocks
        // drawRect(i, j, rainbowFillStyle(9-i, 19-j));

        drawRect(i, j, "white");

        // then on top of bg:
        // FILLED (white circles)
        // if (game.grid[i][j] > 0) {
        if (game.grid[i][j].type !== "air") {
          // drawCircle(i, j, "white");
          // FUN: rainbow~~~~~~~~~~~~
          // ctx.fillStyle = rainbowFillStyle(i, j);
          drawCircle(i, j, rainbowFillStyle(i, j));

        }
      }

      // MODE 1 --------------------------------------------
      if (game.mode === 1) {
        // filled or not, bg
        // ctx.fillStyle = "black";
        ctx.fillStyle = "azure";
        ctx.fillRect(50*i, 50*j, 50, 50);

        // then on top of bg:
        // if (game.grid[i][j] > 0) {
        if (game.grid[i][j].type !== "air") {
          //ctx.filter = `hue-rotate(${Math.random() * 360}deg)`;
          // beautiful rainbow gradient
          //ctx.filter = `hue-rotate(${(i+j)*15}deg)`;
          //ctx.filter = "hue-rotate(60deg)";
          ctx.filter = "hue-rotate(120deg)";
          ctx.drawImage(game.greenMino1, 50*i, 50*j);

          // Reset filter so future drawings aren't affected
          ctx.filter = 'none';
        }
      }


      // MODE 2 --------------------------------------------
      if (game.mode === 2) {

        // gray bg. currently covered by gradient
        ctx.fillStyle = `gray`;
        ctx.fillRect(50*i, 50*j, 50, 50);


        // FILLED
        // if (game.grid[i][j] === 1) {
        if (game.grid[i][j].type !== "air") {
          // ctx.fillStyle = `rgb(${game.turn % 256}, ${game.turn % 119}, ${game.turn % 603})`;
          ctx.fillStyle = "orange";
          ctx.fillRect(50*i, 50*j, 50, 50);
        // EMPTY
        } else {
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

      if (game.mode === 3) {
        drawBlock(game.grid[i][j], i, j);
      }
    }
  }
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

function drawText(text) {
  ctx.font = "48px sans-serif";
  ctx.fillStyle = "purple";
  ctx.fillText(text, 90, 200);
}

// draw moving rainbow bg at specific coords
function drawRainbowBg(x, y) {

  // moved to rainbowfillstyle
  // const cycleTime = 17;
  // const sin1 = Math.sin((x/10) + (1/cycleTime)*game.timer * 2*Math.PI);
  // const sin2 = Math.sin((x/10) + (1/cycleTime)*game.timer * 2*Math.PI + 2*Math.PI / 3);
  // const sin3 = Math.sin((x/10) + (1/cycleTime)*game.timer * 2*Math.PI + 2*2*Math.PI / 3);
  // ctx.fillStyle = `rgb(${128 + sin1 * 128},${128 + sin2 * 128},${128 + sin3 * 128})`;


  ctx.fillStyle = rainbowFillStyle(x, y);

  // ctx.fillStyle = `rgb(
  //   ${Math.floor(233 - (12.5 * ((x + game.timer) % 10)))}
  //   ${Math.floor(250 - (10.5 * y))}
  //   ${Math.floor(0 + (30.5 * y))})`;

  ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, 50, 50);

  // cool test
  // ctx.fillRect(50*x, 50*(10 + 10*(sin1)), 50, 50);
  // ctx.fillRect(50*x, 50*(10 + 10*(sin2)), 50, 50);
  // ctx.fillRect(50*x, 50*(10 + 10*(sin3)), 50, 50);
}

// draw static rainbow bg at specific coords
function drawStaticRainbowBg(x, y) {
  ctx.fillStyle = `rgb(
    ${Math.floor(233 - 12.5 * x)}
    ${Math.floor(250 - 10.5 * y)}
    ${Math.floor(0 + 30.5 * y)})`;

  ctx.fillRect(50*x, 50*y, 50, 50);
}

// draw circle of given color at given coords
function drawCircle(x, y, color) {
  ctx.fillStyle = color;

  // fill...... circle??? -------------
  const radius = CELL_SIZE / 2;

  // Target top-left corner
  const topLeftX = x * CELL_SIZE;
  const topLeftY = y * CELL_SIZE;
  // Calculate center
  const centerX = 50*x + radius;
  const centerY = 50*y + radius;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

  // FILLED CELL CIRCLE COLOR
  // ctx.fillStyle = "cyan";
  // ctx.fillStyle = `rgb(${(game.timer * 100) % 256}, ${(game.timer * 100) % 119}, ${(game.timer * 100) % 603})`;
  // ctx.fillStyle = `rgb(110, 40, 200)`;
  // ctx.fillStyle = `rgb(${(game.timer * 100)}, 0, 0)`;
  ctx.fillStyle = color;

  ctx.fill();
  ctx.closePath();
}

// draw circle of given color at given coords
function drawRect(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
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

function rainbowFillStyle(x, y) {
  const cycleTime = 10; // todo make this a dynamic game var
  const sin1 = Math.sin((x/10) + (y/10) + (1/cycleTime)*game.timer * 2*Math.PI);
  // const sin1 = Math.sin((x/10) + (y/10) + (1.23/cycleTime)*game.timer * 2*Math.PI); // fun: dif freq
  const sin2 = Math.sin((x/10) + (y/10) + (1/cycleTime)*game.timer * 2*Math.PI + 2*Math.PI / 3);
  const sin3 = Math.sin((x/10) + (y/10) + (1/cycleTime)*game.timer * 2*Math.PI + 2*2*Math.PI / 3);
  return `rgb(${128 + sin1 * 128},${128 + sin2 * 128},${128 + sin3 * 128})`;

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
  return game.grid[x][y].type === "air";
  // return game.grid[x][y] == 0; // null
  // return game.grid[x][y] === 0;
}

// yust onscreen + empty
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
  game.activeCenter = [Math.floor((COLS-1) / 2), 1];
}

function funnyTetronimo() {
  return [[rand(),rand()],[rand(),rand()],[rand(),rand()],[rand(),rand()],]
}
function rand() {
  return Math.floor(Math.random() * 3 - 1);
}
// #endregion




// load stuff..
await game.loadEverything();

// Setup grid
game.firstTimeSetup();

// start game loop
core.frame();


