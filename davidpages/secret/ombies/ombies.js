// OMBIES BEGIN.

// copied from tetris.

// get canvas drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// [PIXEL-PERFECT] don't blur scaled sprites
ctx.imageSmoothingEnabled = false;
//size canvas
//inner resolution
canvas.width = 240;
canvas.height = 180;
//rendered resolution
canvas.style.width = "480px";
canvas.style.height = "360px";
//"actual size"
// canvas.style.width = "240px";
// canvas.style.height = "180px";

//debug draw hitboxes
const DRAW_HITBOXES = true;

// sprite: just an image with a "center"
// note: in the future, default hitbox position will be based on sprite center
class Sprite {
  constructor(img, centerX, centerY) {
    // sprites exported directly from scratch will be x2 size
    this.doubleSize = true;

    this.img = img;
    if (this.doubleSize) this.centerX = Math.floor(centerX / 2);
    else this.centerX = centerX;
    if (this.doubleSize) this.centerY = Math.floor(centerY / 2);
    else this.centerY = centerY;
  }

  drawCentered(x, y) {
    x = Math.round(x);
    y = Math.round(y);

    ctx.translate(x, y);

    if (this.doubleSize) ctx.drawImage(this.img, -this.centerX, -this.centerY, this.img.width / 2, this.img.height / 2);
    else ctx.drawImage(this.img, x - this.centerX, y - this.centerY);

    ctx.translate(-x, -y);

  }
  drawCenteredRotated(x, y, rotation) {
    
    ctx.translate(x, y);
    ctx.rotate(rotation);

    if (this.doubleSize) ctx.drawImage(this.img, -this.centerX, -this.centerY, this.img.width / 2, this.img.height / 2);
    else ctx.drawImage(this.img, x - this.centerX, y - this.centerY);
    
    ctx.rotate(-rotation);
    ctx.translate(-x, -y);
  }
}

class AnimationFrame {
  constructor(sprite, duration) {
    this.sprite = sprite;
    this.duration = duration;
  }
}

// Animation: list of frames and durations, knows whether to loop
class Animation {
  constructor(frames, looping) {
    this.frames = frames;
    this.looping = looping;
  }
}

class GameObject {
  constructor(x, y) {
    // coords of its center btw
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.markedForDeletion = false;
  }
  update(delta) {}
  draw() {
    if (DRAW_HITBOXES) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
    }
  }
}

class Player extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 7;
    this.height = 12;

    this.currentAnimation =  null;
    // this.currentAnimation = timWalkAnimation;
    this.currentFrame = null;
    this.nextFrameAt = null;
    this.animTimer = null;
  }
  startAnimation(anim) {
    this.currentAnimation = anim;
    this.currentFrame = 0;
    this.nextFrameAt += this.currentAnimation.frames[this.currentFrame].duration;
    this.animTimer = 0;
  }
  update(delta) {
    //ANIMATION-----------------------------
    // if current animation not null
    if (this.currentAnimation) {
      this.animTimer += delta;
      if (this.animTimer >= this.nextFrameAt) {
        this.currentFrame++;
        // if this is the end of the animation
        if (this.currentFrame >= this.currentAnimation.frames.length) {
          // LOOP
          if (this.currentAnimation.looping) {
            this.currentFrame = 0;
            // reset animTimer, keep it smooth
            this.animTimer -= this.nextFrameAt;
            this.nextFrameAt = 0;
          // OR DONT LOOP
          } else {
            // animation complete...
            this.currentAnimation = null;
          }
        }
        if (this.currentAnimation) this.nextFrameAt += this.currentAnimation.frames[this.currentFrame].duration;
      }
    }

    // move player
    // todo PLAYER_MOVE_SPEED
    if (game.input.held & game.input.keyFlags.ArrowRight) {
      this.x += game.PLAYER_SPEED * delta;
    }
    if (game.input.held & game.input.keyFlags.ArrowLeft) {
      this.x -= game.PLAYER_SPEED * delta;
    }
    if (game.input.held & game.input.keyFlags.ArrowDown) {
      this.y += game.PLAYER_SPEED * delta;
    }
    if (game.input.held & game.input.keyFlags.ArrowUp) {
      this.y -= game.PLAYER_SPEED * delta;
    }

    // space test sound
    if (game.input.held & game.input.keyFlags.Space) {
      game.playSound("test");
    }
  }
  draw() {
    if (this.currentAnimation) this.currentAnimation.frames[this.currentFrame].sprite.drawCentered(this.x, this.y);
    //draw hitboxes..
    super.draw();
  }
}

class Enemy extends GameObject {
  constructor(x, y) {

  }
}

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
const game = {
  // #region GAME VARS -----------------------
  assets: {
    images: {},
    audioBuffers: {}
  },
  // game objects that need to be updated & rendered. maintained in in Y (render) order. todo
  gameObjects: [],
  audioCtx: null,
  input: null,
  // save a reference to the player gameObject
  player: null,
  // temp text display
  text: "starting text",
  //menu/game
  scene: "main menu",
  timer: 0,
  PLAYER_SPEED: 75,
  sprites: {},

  // #endregion

  async loadEverything() {
    console.log("loading...");

    const imagesToLoad = {
      timUp: "img/tim-up.png",
      timDown: "img/tim-down.png"
    };

    const soundsToLoad = {
      test: 'aud/9943__davepape__boink-0020.wav',
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

  audioContextSetup() {
    // create the context immediately (it will start 'suspended')
    game.audioCtx = new AudioContext();

    // Wake up the audio on the first click
    // note: sometimes this doesnt run cuz audioCtx is already running
    window.addEventListener('click', () => {
      if (game.audioCtx.state === 'suspended') {
        console.log("audio unsuspended");////////
        game.audioCtx.resume();
      } else {
        console.log("audio already unsuspended");
      }
      game.text = "audio unlocked";
      // Now playSound() will work
    }, { once: true });
    // set text display to prompt click now
    game.text = "click!";
  },

  firstTimeSetup() {
    // #region INPUT MANAGER
    class InputManager {
      constructor() {
        this.keyFlags = {
          ArrowLeft:  1<<0,
          ArrowRight: 1<<1,
          ArrowDown:  1<<2,
          ArrowUp:    1<<3,
          Space:      1<<4,
          KeyZ:       1<<5,
          KeyX:       1<<6,
        }

        // Vars for tracking keyups/keydowns between frames.
        // physical key states
        this.physicalKeys = 0,
        // "saved keydowns", not reset on keyup
        this.latchedKeys = 0;

        // Vars for using on a given frame.
        // state of keys for this frame. (DOES count quick mid-frame inputs.)
        this.held = 0;
        // all keydowns since last frame
        this.justPressed = 0;
        // all keyups since last frame
        this.justReleased = 0;
        
        // KEYDOWN
        window.addEventListener("keydown", e => {
          const keyFlag = this.keyFlags[e.code];
          // if irrelevant, stop
          if (!keyFlag) return;

          // enable the flags for this key
          this.physicalKeys |= keyFlag;
          this.latchedKeys |= keyFlag;

          //prevent arrows/space from scrolling
          e.preventDefault();
          // console.log(e.code + " pressed");/////////
          
        });

        // KEYUP
        window.addEventListener("keyup", (e) => {
          const keyFlag = this.keyFlags[e.code];
          //if irrelevant, stop
          if (!keyFlag) return;

          //disable flag for this key
          this.physicalKeys &= ~keyFlag;
        });
      }

      update() {
        // "current state" of keys for this frame. counts physically down or briefly tapped keys.
        const current = this.physicalKeys | this.latchedKeys;
        // "held" is kept from last frame
        // just pressed = pressed this frame, NOT pressed last frame
        this.justPressed = current & ~this.held;
        // just released = NOT pressed this frame, pressed last frame
        this.justReleased = ~current & this.held;
        // then held is reset to current frame's state
        this.held = current;
        // and latched keys are forgotten
        this.latchedKeys = 0;
      }
    }
    // #endregion
    this.input = new InputManager();

    game.sprites.timDown = new Sprite(this.assets.images.timDown, 8, 12);
    game.sprites.timUp = new Sprite(this.assets.images.timUp, 4, 14);
    
    // GAME OBJECTS
    //something like this
    game.player = new Player(10, 10);
    const timWalkAnimation = new Animation([
      new AnimationFrame(game.sprites.timDown, 0.25),
      new AnimationFrame(game.sprites.timUp, 0.25)
    ], true);
    // game.player.currentAnimation = timWalkAnimation;
    game.player.startAnimation(timWalkAnimation);
    game.gameObjects.push(this.player);



    //example
    // const timWalkAnimation = new Animation([
    //   new AnimationFrame(game.sprites.timDown, 0.2),
    //   new AnimationFrame(game.sprites.timUp, 0.2)
    // ], false);
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

  update(delta) {
    game.scene = "game"; ///////////
    if (game.scene === "main menu") {
      // menu inputs todo
      // check if mouse over anything, update button states, etc.
      // if mouse down on a button, activate it
      // (maybe arrow keys/ space for menu in future; for now just click)



    } else {
      // timer ticks up
      game.timer += delta;
  
      // controls ======================================
      // prep "held", "justpressed", "justreleased" for this frame
      game.input.update();
  
      // DEBUG: see inputs in console
      // const guh = game.input.justReleased;
      // if (guh !== 0) console.log(guh.toString(2));/////////
  

      game.gameObjects.forEach((obj) => obj.update(delta));
  
  
      // handle keydown actions
  
      //update gameobjects etcs...  
    }
  },

  draw() {
    // clean the slate
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#3b8019";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    drawText(game.text);


    // ctx.fillStyle = "green";
    // round coords
    // ctx.fillRect(Math.floor(this.player.x), Math.floor(this.player.y), 10, 10);
    
    game.gameObjects.forEach((obj) => obj.draw());


  },
}
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
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "purple";
  ctx.fillText(text, 45, 100);
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

// #endregion

// #region UTILITY FUNCS ----------------------------------------------

function rand() {
  return Math.floor(Math.random() * 3 - 1);
}
// #endregion




game.audioContextSetup();

// load stuff..
await game.loadEverything();

// setup
game.firstTimeSetup();

// start game loop
core.frame();


