// TODO neewe rotation data for Z
//
//


document.addEventListener('DOMContentLoaded', function () {
    //grid setup
    const grid = document.querySelector(".grid")
    let squares = Array.from(document.querySelectorAll(".grid div"))
    const width = 10;

    //mini-grid setup
    const miniSquares = document.querySelectorAll('.mini-grid div')
    const previewWidth = 4

    //other shit setup (only first-time setup, seperate function for (re)starting game)
    const scoreDisplay = document.querySelector("#score")
    const startBtn = document.querySelector("#start-button")
    
    var gameStepTimer = function(callback, delay) {
        var timerId;

        this.pause = function() {
            window.clearInterval(timerId);
            timerId = null;
        }

        this.start = function() {
            timerId = window.setInterval(callback, delay);
        }

        this.restart = function() {
            window.clearInterval(timerId);
            timerId = window.setInterval(callback, delay);
        }

        //this.start();
    };

    let timer = new gameStepTimer(() => {moveDown(true)}, 500);

    //let leftRepeatTimer;
    //let rightRepeatTimer;
    //let downRepeatTimer;
    
    //apparently cant initialize here whatever
    //let leftRepeatTimer = new keyRepeatTimer(moveLeft, 500, 250);
    //let rightRepeatTimer = new keyRepeatTimer(moveRight, 500, 250);
    //let downRepeatTimer = new keyRepeatTimer(moveDown, 500, 250);
    
    
    
    let gameOver = true; // begins w no game active, button will start one
    let paused = true; // for preventing moves while paused
    let score = 0;

    ////blues browns pruples
    //const colors = [
    //    "#485388",
    //    "#4D362E",
    //    "#2E3527",
    //    "#4F665C",
    //    "#334D4D",
    //    "#2D5E70",
    //    "#683E56"
    //]

    //more bright purple/cyan/green/white
    const colors = [
        "#C1E796",
        "#51335E",
        "#516C48",
        "#392337",
        "#78A89E",
        "#ACE5B0",
        "#3B6161"
    ]

    //const colors = [
    //    "black",
    //    "black",
    //    "black",
    //    "black",
    //    "black",
    //    "black",
    //    "black"
    //]
    
    //shuffleArray(colors);

    function shuffleArray(array) {
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    
    // grayish purple/green palette
    // https://coolors.co/000000-beaebe-2c152a-3f2c3e-524252-706472-93938c-ced8bf-e0f1cd

    /// more bright purple/cyan/green/white
    // https://coolors.co/000000-b5c7ce-392337-51335e-516c48-3b6161-78a89e-ace5b0-efefda

    //TODO: continue new blueprint/rotation framework

    //returns tetromino blueprint for any shape, rotation, offset, row width
    //blueprint consists of a list of one-dimensional numbers, as offsets from the piece's origin 
    function getTetrominoBlueprint(shape, rotation, rowWidth) {
        //start w shape definition
        let unRotated = theTetrominos[shape]

        //apply true rotation
        let rotated = trueRotate(unRotated, rotation)

        //translate into one-dimensional relative indexes
        let converted = [];
        rotated.forEach(coords => {
            converted.push(-coords[1] * rowWidth + coords[0]) //-coords bc positive Y is upwards
        })

        //return
        return converted;

    }

    //true mathematical rotation
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
            let rotatedX = Math.round(originalX * Math.cos(-rotation * Math.PI / 2) - originalY * Math.sin(-rotation * (Math.PI / 2))) // the "-rotation" is to convert amount of positive clockwise rotations into the factor to multiply the counterclockwise PI/2 rotation by
            let rotatedY = Math.round(originalX * Math.sin(-rotation * Math.PI / 2) + originalY * Math.cos(-rotation * (Math.PI / 2)))
            rotated.push([rotatedX, rotatedY])
            //console.log(rotatedX + " " + rotatedY)
        }

        //console.log("loop ended, rotated length: " + rotated.length)

        //console.log("pre-rotation: " + unRotated)
        //console.log("post-rotation: " + rotated)

        return rotated;
    }

    //REAL, HUMAN tetronimos...
    //JLSZT I O

    //J (0)
    const jTetronimo = [
        [-1, 1],
        [-1, 0],
        [0, 0],
        [1, 0]
    ]

    //L (1)
    const lTetronimo = [
        [1, 1],
        [-1, 0],
        [0, 0],
        [1, 0]
    ]

    //S (2)
    const sTetronimo = [
        [0, 1],
        [1, 1],
        [-1, 0],
        [0, 0]
    ]

    //Z (3)
    const zTetronimo = [
        [-1, 1],
        [0, 1],
        [0, 0],
        [1, 0]
    ]

    //T (4)
    const tTetronimo = [
        [0, 1],
        [-1, 0],
        [0, 0],
        [1, 0]
    ]

    //I (5)
    const iTetronimo = [
        [-1, 0],
        [0, 0],
        [1, 0],
        [2, 0]
    ]

    //O (6)
    const oTetronimo = [
        [0, 1],
        [1, 1],
        [0, 0],
        [1, 0]
    ]

    //JLSZT I O
    const theTetrominos = [jTetronimo, lTetronimo, sTetronimo, zTetronimo, tTetronimo, iTetronimo, oTetronimo]

    //finally the REAL offset data...
    const realOffsetDataJST = [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [-1, 1]
    ]

    //finally the REAL offset data...
    const realOffsetDataIfrom0 = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 0],
        [2, 0],
        [-1, 1],
        [2, 1],
        [0, -1],
        [1, -1],
        [0, 2],
        [1, 2],
        [-1, -1],
        [2, -1],
        [-1, 2],
        [2, 2],
    ]

    //finally the REAL offset data...
    const realOffsetDataIfrom1 = [
        [0, 0],
        [-1, 0],
        [0, -1],
        [-1, -1],
        [1, 0],
        [-2, 0],
        [1, -1],
        [-2, -1],
        [0, -2],
        [-1, -2],
        [1, -2],
        [-2, -2],
        [0, 1],
        [-1, 1],
        [1, 1],
        [-2, 1],
    ]



    //real ACTUAL offset datas------------------------

    const realOffsetDataJ = [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [-1, -1],
        [0, -1],
    ]

    const realOffsetDataL = [ //swapped+flipped coords from J, except last one i guess
        [0, 0],
        [0, 1],
        [-1, 1],
        [1, 1],
        [-1, 0],
    ]

    const realOffsetDataSfrom0 = [
        [0, 0],
        [-1, 0],
        [0, 1],
        [-1, 1],
    ]

    const realOffsetDataSfrom1 = [
        [0, 0], //exception here: if would use this one, instead try next one first
        [1, -1],
        [0, -1],
        [1, 0],
    ]

    const realOffsetDataT = [
        [0, 0],
        [0, 1],
        [-1, 0],
        [-1, 1],
    ]




    //(re)start game
    function startGame() {

        // audio web api setup stuff
        var context;
        window.addEventListener('load', init, false);
        function init() {
            try {
            context = new AudioContext();
            }
            catch(e) {
            alert('Web Audio API is not supported in this browser');
            }
        }

        // load sounds ----------------------------

        var context = new AudioContext();

        var soundClip = function(url) {
            var myBuffer;
    
            // load audio into buffer
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                myBuffer = buffer;
            }, onError);
            }
            request.send();

            this.play = function() {
                var source = context.createBufferSource(); // creates a sound source
                source.buffer = myBuffer;                  // tell the source which sound to play
                source.connect(context.destination);       // connect the source to the context's destination (the speakers)
                source.noteOn(0);                          // play the source now
            }
        };

        var moveBuffer = new soundClip("davidpages\TETRIS v3 test\tetris v3 sounds\move.wav");
        moveBuffer.play();
        //var rotateBuffer = null;
        //var freezeBuffer = null;
        //var clearBuffer = null;
        //var tetrisBuffer = null;




        // copypasted from web audiio api tutorrial

        //function loadSound(url) {
        //    var request = new XMLHttpRequest();
        //    request.open('GET', url, true);
        //    request.responseType = 'arraybuffer';

        //    // Decode asynchronously
        //    request.onload = function() {
        //    context.decodeAudioData(request.response, function(buffer) {
        //        moveBuffer = buffer;
        //    }, onError);
        //    }
        //    request.send();
        //}








        //clear entire grid
        for (let i = 0; i < 200; i += 1) {
            squares[i].classList.remove("taken")
            squares[i].classList.remove("tetromino")
            squares[i].style.backgroundColor = ""
        }

        //reset score
        score = 0
        scoreDisplay.innerHTML = score;

        //game is now active
        gameOver = false;

        //initialize next shape, spawn first tetromino
        nextShape = Math.floor(Math.random() * 7)
        spawnNext()
    }

    //pause game
    function pause() {
        //this is for preventing moves etc
        paused = true;

        //pause auto moving timer
        timer.pause();
        //console.log("timer paused")

        //clear key repeat timers
        leftRepeatTimer.clear();
        rightRepeatTimer.clear();
        downRepeatTimer.clear();
    }

    //unpause game
    function unPause() {
        paused = false;

        //start moveDown timer
        timer.restart();

        //draw current tetromino
        draw();

        //display next one
        displayShape();
    }

    //spawn next piece
    function spawnNext() {
        currentPosition = width + 4
        currentRotation = 0
        currentShape = nextShape
        current = getTetrominoBlueprint(currentShape, currentRotation, width)
        nextShape = Math.floor(Math.random() * 7)
        displayShape()
    }

    //game over
    function checkGameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            scoreDisplay.innerHTML = "GAME OVER. FINAL SCORE: " + score

            pause();

            //prep for restart
            gameOver = true;
        }
    }

    //assign functions to keycodes
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    function handleKeyDown(e) {
        //console.log(e.keyCode)
        if (paused) { //if paused, only option is restart
            if (e.keyCode == 82 && !e.repeat) { //R
                if (gameOver) {
                    startGame()
                    unPause()
                }
            }
        } else { //if unpaused, allow moves
            if (e.keyCode == 37 && !e.repeat) { //left
                moveLeft()
                rightRepeatTimer.clear(); //cancel other direction if its repeating
                leftRepeatTimer.start()
            } else if (e.keyCode == 39 && !e.repeat) { //right
                moveRight()
                leftRepeatTimer.clear(); //cancel other direction if its repeating
                rightRepeatTimer.start()
            } else if (e.keyCode == 38 && !e.repeat) { //up
                rotate()
            } else if (e.keyCode == 40 && !e.repeat) { //down
                moveDown(false)
                downRepeatTimer.start()
            } else if ((e.keyCode == 88 || e.keyCode == 32) && !e.repeat) { //X or space
                hardDrop()
            }
        }

        //regardless of whether paused:
        if (e.keyCode == 67 && !e.repeat) { //C: same behaviour as start btn
            if (!paused) {
                pause()
            } else {
                if (gameOver) {
                    startGame()
                }
                unPause()
            }
        }
    }

    //need key up detection to stop key repeats
    function handleKeyUp(e) {
        //console.log(e.keyCode)
        if (paused) {
            
        } else { //if unpaused, allow moves
            if (e.keyCode == 37) { //left
                leftRepeatTimer.clear();
            } else if (e.keyCode == 39) { //right
                rightRepeatTimer.clear();
            } else if (e.keyCode == 40) { //down
                downRepeatTimer.clear();
            }
        }
    }

    var keyRepeatTimer = function(callback, initialDelay, repeatDelay) {
        var initialTimer, repeatTimer;

        this.start = function() {
            if (initialTimer == null) {
                initialTimer = window.setTimeout(() => {this.startRepeating()}, initialDelay);
            } else {
                console.log("start called but already renning..")
            }
            
            //initialTimer = window.setTimeout(() => {console.log("initialTimer finished")}, initialDelay);
        }

        this.clear = function() {
            window.clearTimeout(initialTimer);
            window.clearInterval(repeatTimer);
            initialTimer = null;
            repeatTimer = null;
            //repeatTimer = null; //dont think this is necessary
        }

        this.startRepeating = function() {
            console.log("started repeateding");
            callback();
            repeatTimer = window.setInterval(callback, repeatDelay);
        }

        //this.start();
    };

    let leftRepeatTimer = new keyRepeatTimer(() => {moveLeft()}, 200, 100);
    let rightRepeatTimer = new keyRepeatTimer(() => {moveRight()}, 200, 100);
    let downRepeatTimer = new keyRepeatTimer(() => {moveDown(false)}, 200, 100);

    //draw current
    function draw() {
        current.forEach(relativeIndex => {
            squares[currentPosition + relativeIndex].classList.add("tetromino")
            squares[currentPosition + relativeIndex].style.backgroundColor = colors[currentShape]
        })
    }

    //undraw current
    function undraw() {
        current.forEach(relativeIndex => {
            squares[currentPosition + relativeIndex].classList.remove("tetromino")
            squares[currentPosition + relativeIndex].style.backgroundColor = ""
        })
    }

    //move down, if can't: freeze and spawn new piece
    function moveDown(canFreeze) {
        if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) { //if touching ground:
            // if this move is allowed to freeze, freeze and spawn new one (otherwise do nothing)
            if (canFreeze) {
                timer.restart(); // Reset game step timer
                current.forEach(index => squares[currentPosition + index].classList.add("taken"))
                addScore()
                spawnNext()
                checkGameOver()
                draw()
            }
        } else {
            //else move down
            
            timer.restart(); // Reset game step timer
            undraw()
            currentPosition += width
            draw()
        }
    }

    //need my hard drop.... TODO: make score differently
    function hardDrop() {
        undraw()
        while (!current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) { //repeat until on ground
            currentPosition += width
        }
        draw()
        moveDown(true) //guaranteed to be on ground, so this will freeze/score/spawn new one

        //TODO: for unique scoring for hard drop, abstract out some logic from moveDown so I can pick and choose what to do here
    }

    function moveLeft() {
        if (current.some(index => { // first check if any indaeesx are out of bounds
            return ((currentPosition + index - 1) < 0 || (currentPosition + index - 1) > squares.length - 1);
        })) {
            console.log("moveLeft cancelled due to out of bounds")
            return;
        }
        undraw()
        const touchingLeftEdge = current.some(index => (currentPosition + index) % width == 0)
        const touchingTakenOnLeft = current.some(index => squares[currentPosition + index - 1].classList.contains("taken"))
        if (!touchingLeftEdge && !touchingTakenOnLeft) currentPosition -= 1
        draw()
    }

    function moveRight() {
        if (current.some(index => { // first check if any indaeesx are out of bounds
            return ((currentPosition + index + 1) < 0 || (currentPosition + index + 1) > squares.length - 1);
        })) {
            console.log("moveRight cancelled due to out of bounds")
            return;
        }
        undraw()
        const touchingRightEdge = current.some(index => (currentPosition + index) % width == width - 1)
        const touchingTakenOnRight = current.some(index => squares[currentPosition + index + 1].classList.contains("taken"))
        if (!touchingRightEdge && !touchingTakenOnRight) currentPosition += 1
        draw()
    }

    function rotate() {
        console.log("BEGIN ROTATION for shape" + currentShape)

        //O cant rotate
        if (currentShape == 6) {
            return;
        }

        undraw()

        //remember current rotation for undo if rotation fails
        let priorRotation = currentRotation;

        //update currentRotation
        if (currentShape == 2 || //2-rotation-state blocks : SZI
            currentShape == 3 ||
            currentShape == 5
        ) {
            currentRotation = (currentRotation + 1) % 2
        } else if (currentShape == 0 || //4-rotation-state blocks: JLT
            currentShape == 1 ||
            currentShape == 4
        ) {
            currentRotation = (currentRotation + 1) % 4
        }

        //console.log("shape: " + currentShape + ", rotation: " + currentRotation);

        current = getTetrominoBlueprint(currentShape, currentRotation, width)

        //console.log("current after setting to blueprint: " + current)
        //console.log("currentPosition: " + currentPosition)

        //check each offset for legality:
        //first, assume illegal
        let legal = false;
        
        let offsetX;
        let offsetY;
        
        let offsetConverted;

        //loop through each offset value in the table, exit loop if legal one is found
        offsetData = offsetDataForCurrentState()
        //console.log("offsetData " + offsetData)
        for (offsetAttempt = 0; offsetAttempt < offsetData.length && !legal; offsetAttempt++) {
            offsetX = offsetData[offsetAttempt][0]
            offsetY = offsetData[offsetAttempt][1]
            legal = isLegalOffset(offsetX, offsetY)
            offsetConverted = -(offsetY * width) + (offsetX)
        
            //exception for S from state 1: if first offset is would be used, first check if a certain (non-current) square is taken, and if so, attempt different offset first
            if (currentShape == 2 &&
                currentRotation == 0 &&
                offsetAttempt == 0 &&
                legal &&
                isRelativeSquareTaken(-(-1 * width) + (-1)) // (-1, -1)
            ) {
                
                if (isLegalOffset(offsetData[1][0], offsetData[1][1])) {
                    offsetX = offsetData[1][0]
                    offsetY = offsetData[1][1]
                    offsetConverted = -(offsetY * width) + (offsetX) // offsetDataSfrom1[1] is (1,-1)
                }
            }

            
        }

        //if legal offset found, update position; otherwise KILL YOURSELF (cancel rotation)
        if (legal) { //this means a legal offset was found; update position
            currentPosition += offsetConverted;
            //console.log("rotation success; offset amt: (" + offsetX + ", " + offsetY + ")")//////////////////////////////////////////////////////////////////////////////////////////////////////////
        } else { //this means no legal rotation was found; undo rotation
            //update rotation, current array
            currentRotation = priorRotation;
            current = getTetrominoBlueprint(currentShape, currentRotation, width)
            console.log("rotation FAILED")
        }

        draw()
        console.log("COMPLETE ROTATION")
    }

    //helper to check if a given currentposition, offset, rotation is legal
    function isLegalOffset(offsetX, offsetY) {
        //console.log("checking legality of " + offsetX + ", " + offsetY)
        
        let offsetConverted = -(offsetY * width) + (offsetX)

        //check for intersections in current tentative offset
        let intersecting = current.some((index) => {
            return isRelativeSquareTaken(offsetConverted + index);
        })

        //legal if not intersecting anything
        return !intersecting
    }

    function isRelativeSquareTaken(offsetConverted) {
    
        let intersectingTaken;
        let intersectingEdge;

        //if offset amount is out of bounds of grid, is intersecting edge
        if ((currentPosition + offsetConverted) < 0 ||
            (currentPosition + offsetConverted) > squares.length
        ) {
            intersectingTaken = true
        } else { //othrwise only if an index sqauare is "taken"
            intersectingTaken = squares[currentPosition + offsetConverted].classList.contains("taken")
        }

        if (currentPosition % width <= 4) {
            //if was on left, and any squares end up on rightmost column, INTERSECTION!
            intersectingEdge = (currentPosition + offsetConverted) % width == width - 1
        } else {
            //if was on right, and any squares end up on leftmost column, INTERSECTION!
            intersectingEdge = (currentPosition + offsetConverted) % width == 0
        }

        //true if intersecting taken OR goes over an edge
        return intersectingTaken || intersectingEdge
    }

    function offsetDataForCurrentState() {
        //console.log("looking up offsetData for shape " + currentShape)
        switch (currentShape) {
            case 0: //J
                return trueRotate(realOffsetDataJ, currentRotation - 1)
            case 1: //L
                return trueRotate(realOffsetDataL, currentRotation - 1)
            case 2: //S
                if (currentRotation == 0) {
                    return realOffsetDataSfrom1
                }
                if (currentRotation == 1) {
                    return realOffsetDataSfrom0
                }
            case 3: //Z
                return trueRotate(realOffsetDataJST, currentRotation - 1 + 1)
            case 4: //T
                return trueRotate(realOffsetDataT, currentRotation - 1)
            case 5: //I
                if (currentRotation == 0) {
                    return realOffsetDataIfrom1
                }
                if (currentRotation == 1) {
                    return realOffsetDataIfrom0
                }
        }

        console.log("ERROR: tried to fetch illegal offset data: currentShape " + currentShape + ", currentRotation " + currentRotation)
    }

    //display next shape in mini-grid
    function displayShape() {
        //clear grid of any tetrominos
        miniSquares.forEach(square => {
            square.classList.remove("tetromino")
            square.style.backgroundColor = ""
        })

        //for each cell in fetched nextShape blueprint, fill cell in preview.
        getTetrominoBlueprint(nextShape, 0, previewWidth).forEach(toFill => {
            miniSquares[2 * previewWidth + 1 + toFill].classList.add("tetromino");
            miniSquares[2 * previewWidth + 1 + toFill].style.backgroundColor = colors[nextShape]
        })
    }

    //start button
    startBtn.addEventListener('click', () => {

        //testing array rotation
        //console.log("unrotated: " + getTetrominoBlueprint(0, 0, 0, 10))
        ////debug/testing: do this instead of starting game
        //console.log("rotated: " + getTetrominoBlueprint(0, 1, 0, 10))

        ////testing getTetrominoBlueprint(shape, rotation, offsetNum, rowWidth)
        //console.log("get tetromino blueprint: " + getTetrominoBlueprint(0, 0, 999, width))

        ////testing trueRotate
        ////console.log(trueRotate([[0, 0], [1, 0], [1, 1]]))
        //testArray = [[0, 0], [1, 0], [1, 1]]
        //console.log("before rotation: " + testArray)
        //console.log("after rotation: " + trueRotate(testArray, 1))

        if (!paused) {
            pause()
        } else {
            if (gameOver) {
                startGame()
            }
            unPause()
        }
    })

    function addScore() {
        for (let i = 0; i < 200; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]
            if (row.every(index => squares[index].classList.contains("taken"))) {
                score += 1;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove("taken")
                    squares[index].classList.remove("tetromino")
                    squares[index].style.backgroundColor = ""
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(square => grid.appendChild(square))
            }
        }
    }
});