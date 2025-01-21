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
    let timerId;
    let gameOver = true; // begins w no game active, button will start one
    let paused = true; // for preventing moves while paused
    let score = 0;
    const colors = [
        "red",
        "orange",
        "green",
        "blue",
        "purple",
        "pink",
        "gray"
    ]

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
            converted.push(-coords[1]*rowWidth+coords[0]) //-coords bc positive Y is upwards
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
        for (i = 0; i < unRotated.length; i++) { //rotate X and Y values
            let originalX = unRotated[i][0]
            let originalY = unRotated[i][1]
            let rotatedX = Math.round(originalX * Math.cos(-rotation*Math.PI/2) - originalY * Math.sin(-rotation*Math.PI/2)) // the "-rotation" is to convert amount of positive clockwise rotations into the factor to multiply the counterclockwise PI/2 rotation by
            let rotatedY = Math.round(originalX * Math.sin(-rotation*Math.PI/2) + originalY * Math.cos(-rotation*Math.PI/2))
            rotated.push([rotatedX, rotatedY])
        }

        //console.log("pre-rotation: " + unRotated)
        //console.log("post-rotation: " + rotated)

        return rotated;
    }

    //REAL, HUMAN tetronimos...
    //JLSZT I O

    //J
    const jTetronimo = [
        [-1, 1], 
        [-1, 0], 
        [0, 0], 
        [1, 0]
    ]

    //L
    const lTetronimo = [
        [1, 1], 
        [-1, 0], 
        [0, 0], 
        [1, 0]
    ]

    //S
    const sTetronimo = [
        [0, 1], 
        [1, 1], 
        [-1, 0], 
        [0, 0]
    ]

    //Z
    const zTetronimo = [
        [-1, 1], 
        [0, 1], 
        [0, 0], 
        [1, 0]
    ]

    //T
    const tTetronimo = [
        [0, 1], 
        [-1, 0], 
        [0, 0], 
        [1, 0]
    ]

    //I
    const iTetronimo = [
        [-1, 0], 
        [0, 0], 
        [1, 0], 
        [2, 0]
    ]

    //O
    const oTetronimo = [
        [0, 1], 
        [1, 1], 
        [0, 0], 
        [1, 0]
    ]

    //JLSZT I O
    const theTetrominos = [jTetronimo, lTetronimo, sTetronimo, zTetronimo, tTetronimo, iTetronimo, oTetronimo]

    //REAL offset data...
    //nothing fancy, just attempt these translations in order
    const offsetData = [
        [0, 0],
        [0, 1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [1, 1]
    ]

    //FAKE, OLD tetronimos......
    ////tetromino definitions TODO: add reflections of L and S
    //const jTetromino = [
    //    [0, width, width+1, 2*width+1]
    //]

    //const zTetromino = [
    //    [width, width + 1, 2*width+1, 2*width+2],
    //    [2, width + 1, width+2, 2*width+1],
    //    [width, width + 1, 2*width+1, 2*width+2],
    //    [2, width + 1, width+2, 2*width+1],
    //]

    //const tTetromino = [
    //    [width, width+1, width+2, 2*width+1],
    //    [1, width, width+1, 2*width+1],
    //    [1, width, width+1, width+2],
    //    [1, width+1, width+2, 2*width+1],
    //]

    //const oTetromino = [
    //    [width+1, width+2, 2*width+1, 2*width+2],
    //    [width+1, width+2, 2*width+1, 2*width+2],
    //    [width+1, width+2, 2*width+1, 2*width+2],
    //    [width+1, width+2, 2*width+1, 2*width+2],
    //]

    //const iTetromino = [
    //    [width, width+1, width+2, width+3],
    //    [1, width+1, 2*width+1, 3*width+1],
    //    [width, width+1, width+2, width+3],
    //    [1, width+1, 2*width+1, 3*width+1],
    //]

    //const theTetrominos = [jTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    //const thePreviewTetrominos = [
    //    [1, 2, previewWidth+1, 2*previewWidth+1],
    //    [previewWidth, previewWidth + 1, 2*previewWidth+1, 2*previewWidth+2],
    //    [previewWidth, previewWidth+1, previewWidth+2, 2*previewWidth+1],
    //    [previewWidth+1, previewWidth+2, 2*previewWidth+1, 2*previewWidth+2],
    //    [previewWidth, previewWidth+1, previewWidth+2, previewWidth+3],
    //]
    
    ////fake, OLD, DUMB offset data...
    //const offsetData = [
    //    //JLSZT
    //    [
    //        //rotation 1
    //        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 2
    //        [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], 
    //        //rotation 3
    //        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 4
    //        [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
    //    ],
    //    //I
    //    [
    //        //rotation 1
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 2
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 3
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 4
    //        [[0, 0], [0, 0], [0, 0], [0, 0]]
    //    ],
    //    //O
    //    [
    //        //rotation 1
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 2
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 3
    //        [[0, 0], [0, 0], [0, 0], [0, 0]], 
    //        //rotation 4
    //        [[0, 0], [0, 0], [0, 0], [0, 0]]
    //    ],
    //]




    //(re)start game
    function startGame() {
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
        clearInterval(timerId)
        timerId = null
    }

    //unpause game
    function unPause() {
        paused = false;

        //start moveDown timer
        timerId = setInterval(moveDown, 500)

        //draw current tetromino
        draw()

        //display next one
        displayShape()
    }

    //spawn next piece
    function spawnNext() {
        currentPosition = width+4
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
            
            pause()

            //prep for restart
            gameOver = true;
        }
    }

    //assign functions to keycodes
    document.addEventListener('keydown', control)
    function control(e) {
        //console.log(e.keyCode)
        if (paused) { //if paused, only option is restart
            if (e.keyCode == 82) { //R
                if (gameOver) {
                    startGame()
                    unPause()
                }
            }
        } else { //if unpaused, allow moves
            if (e.keyCode == 37) { //left
                moveLeft()
            } else if (e.keyCode == 39) { //right
                moveRight()
            } else if (e.keyCode == 38) { //up
                rotate()
            } else if (e.keyCode == 40) { //down
                moveDown()
            } else if (e.keyCode == 88 || e.keyCode == 32) { //X or space
                hardDrop()
            }
        }
    }

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
    function moveDown() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
            //if touching ground, freeze and spawn new one
            current.forEach(index => squares[currentPosition + index].classList.add("taken"))

            addScore()

            spawnNext()

            checkGameOver()

            //draw()
        } else {
            //else move down
            undraw()
            currentPosition += width
        }
        draw()
    }

    //need my hard drop.... TODO: make score differently
    function hardDrop() {
        undraw()
        while (!current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) { //repeat until on ground
            currentPosition += width
        }
        draw()
        moveDown() //guaranteed to be on ground, so this will freeze/score/spawn new one

        //TODO: for unique scoring for hard drop, abstract out some logic from moveDown so I can pick and choose what to do here
    }

    function moveLeft() {
        undraw()
        const touchingLeftEdge = current.some(index => (currentPosition + index) % width == 0)
        const touchingTakenOnLeft = current.some(index => squares[currentPosition + index - 1].classList.contains("taken"))
        if (!touchingLeftEdge && !touchingTakenOnLeft) currentPosition -= 1
        draw()
    }

    function moveRight() {
        undraw()
        const touchingRightEdge = current.some(index => (currentPosition + index) % width == width - 1)
        const touchingTakenOnRight = current.some(index => squares[currentPosition + index + 1].classList.contains("taken"))
        if (!touchingRightEdge && !touchingTakenOnRight) currentPosition += 1
        draw()
    }

    function rotate() {
        //O cant rotate
        if (currentShape == 6) {
            return;
        }
        
        undraw()

        //first record which half pre-rotation piece is in (for preventing edge clips)
        let wasOnLeftSide = currentPosition % width <= 4;

        //update rotation, current array
        currentRotation = currentRotation + 1 % 4
        current = getTetrominoBlueprint(currentShape, currentRotation, width)

        //check each offset for legality:
        //first, assume illegal
        let offsetConverted;
        let legal = false;
        
        //loop through each offset value in the table, exit loop if legal one is found
        for (offsetIndex = 0; offsetIndex < offsetData.length && !legal; offsetIndex++) {
            //get current tentative offset, converted to one-dimensional relative index
            
            const offsetX = offsetData[offsetIndex][0]
            const offsetY = offsetData[offsetIndex][1]
            //console.log("index: " + offsetIndex + ": (" + offsetX + ", " + offsetY + ")")
            offsetConverted = -(offsetY*width)+(offsetX)

            //check for intersections in current tentative offset
            let intersecting = current.some(index => {
                //for each square, check intersections:
            
                let intersectingTaken = squares[currentPosition + index + offsetConverted].classList.contains("taken")
                
                let intersectingEdge;
                if (wasOnLeftSide) {
                    //if was on left, and any squares end up on rightmost column, INTERSECTION!
                    intersectingEdge = (currentPosition + index + offsetConverted) % width == width - 1
                } else {
                    //if was on right, and any squares end up on leftmost column, INTERSECTION!
                    intersectingEdge = (currentPosition + index + offsetConverted) % width == 0
                }

                //true if intersecting taken OR goes over edge
                return intersectingTaken || intersectingEdge
            })

            //if no intersections found, LEGAL!
            legal = !intersecting
        }

        //if legal offset found, update position; otherwise KILL YOURSELF (cancel rotation)
        if (legal) { //this means a legal offset was found; update position
            currentPosition += offsetConverted;
            //console.log("rotation success")
        } else { //this means no legal rotation was found; undo rotation
            currentRotation = currentRotation - 1 % 4
            current = getTetrominoBlueprint(currentShape, currentRotation, width)
            //console.log("rotation FAILED")
        }

        draw()
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
            miniSquares[2*previewWidth + 1 + toFill].classList.add("tetromino");
            miniSquares[2*previewWidth + 1 + toFill].style.backgroundColor = colors[nextShape]
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

        if (timerId) {
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
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
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