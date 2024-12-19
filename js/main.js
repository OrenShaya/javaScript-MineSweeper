'use strict'

/**
 * gGmae have everything game related
 *  rows - number of rows
 *  cols - number of columns
 *  mines - to count the mines
 *  minesLoc - an array with {i: i, j: j} of mine locations
 *  lifes - number of lifes
 *  hints - number of hints
 * 
 * gBoard a 2D array with the board backend
 *  each cell has:
 *      status: 'open' or 'unopend' or 'marked'
 *      content: MINE or CLEAR
 * 
 * stuff TODO:
 *   safe click - shows a safe cell to click
 *  add sound ?
 *  
 */

const MINE = '💣'
const CLEAR = '🔵' // '🐾🏞💧🕳🔘⬛⬜'
const FLAG = '🚩'
const LIFE = '❤️'

const gGame = {}
const gBoard = []

function onInit(elBtn) {
    if (!elBtn) {
        if (gGame.diffuclty) {
            elBtn = document.querySelector(`.${gGame.diffuclty}`)
        } else {
            elBtn = document.querySelector('.intermidiate');
        }
    }
    gGame.status = 'playing'
    gGame.lifes = 3
    gGame.hints = 3
    gGame.isHintOn = false
    gGame.firstClick = true

    // empty in case left from prev game
    while (gBoard.length > 0) {
        gBoard.pop()
    }

    // remove potential game over screen
    var elGameOver = document.querySelector('.game-over')
    elGameOver.style.display = 'none'
   
    switch (elBtn.classList[1]) {
        case 'beginner': 
            console.log('Starting new game at beginner level')
            gGame.diffuclty = 'beginner'
            buildBoard(4, 4, 2)
            renderBoard()
            break
        case 'intermidiate':
            console.log('Starting new game at intermidiate level')
            gGame.diffuclty = 'intermidiate'
            buildBoard(8, 8, 14)
            renderBoard()
            break
        case 'expert': 
            console.log('Starting new game at expert level') 
            gGame.diffuclty = 'expert'
            buildBoard(12, 12, 32)
            renderBoard()
            break
        case 'real-expert':
            console.log('Starting new game at real expert level')
            gGame.diffuclty = 'real-expert'
            buildBoard(16, 30, 99)
            renderBoard()         
            break
    }
}

function buildBoard(rows, cols, mines) {
    gGame.rows = rows
    gGame.cols = cols
    gGame.mines = mines

    for (let i = 0; i < rows; i++) {
        var row = []
        for (let j = 0; j < cols; j++) {
            row.push(createCell())
        }
        gBoard.push(row)
    }
    gGame.mines = mines
}

function renderBoard() {
    
    var strHTML = '<table><tbody>'
    for (var i = 0; i < gGame.rows; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < gGame.cols; j++) {

            const cell = gBoard[i][j]

            strHTML += `<td onclick="onCellClick(this)" 
                    oncontextmenu="onCellMarked(this)"
                    class="cell ${cell.status}" 
                    data-location="cell-${i}-${j}"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
    // stops right click default function
    elContainer.addEventListener("contextmenu",function(e) {e.preventDefault()});

    updateSmiley('🙂')

    // hints
    const elHints = document.querySelector('.hints-text')
    elHints.innerText = 'Hints:'
    const elHintsSymbol = document.querySelector('.hints-symbol')
    elHintsSymbol.innerText = '💡💡💡'

    // add life
    const elLifeText = document.querySelector('.life-text')
    elLifeText.innerText = 'Lives: '
    updateLifes()

    // add mines counter
    const elMineCounterText = document.querySelector('.mines-counter-text')
    elMineCounterText.innerText = 'Mines left:'
    var elMineCounterNum = document.querySelector('.mines-counter-num')
    elMineCounterNum.innerText = gGame.mines
}

function onCellClick(elCell) {
    if (gGame.status === 'game over') return

    // cell-2-4
    var loc = elCell.dataset.location.split('-')
    loc = {i: +loc[1], j: +loc[2]}
    // first click
    if (gGame.firstClick) { 
        gGame.minesLoc = createMinesLocations(loc)
        placeMines()
        countMines()
        gGame.firstClick = false
    }
    // hint
    if (gGame.isHintOn) {
        gGame.isHintOn = false
        openNegsHint(loc)
        return
    }
    
    elCell.classList.remove('unopened')
    elCell.classList.add('opened')

    showCell(loc)

    gBoard[loc.i][loc.j].status = 'opened'

    if (gBoard[loc.i][loc.j].content === MINE) {
        gGame.lifes--
        updateLifes()
        var elMineCounter = document.querySelector('.mines-counter-num')
        elMineCounter.innerText = +elMineCounter.innerText - 1
        
        updateSmiley('😫')
        setTimeout(updateSmiley, 1500, '🙂')


        if (gGame.lifes === 0) gameOver('lose')
    } else if (gBoard[loc.i][loc.j].content === 0) {
        openNegs(loc)
    }
    if (checkWin()) gameOver('win')
}

function onCellMarked(elCell) {
    var loc = elCell.dataset.location.split('-')
    loc = {i: loc[1], j: loc[2]}
    
    var mineDiff
    if (gBoard[loc.i][loc.j].status === 'marked') {
        // unmark it
        elCell.innerText = ''
        
        mineDiff = 1

        gBoard[loc.i][loc.j].status = 'unopened'
    }   // mark it
    else if (gBoard[loc.i][loc.j].status === 'unopened') {
        elCell.innerText = FLAG
        gBoard[loc.i][loc.j].status = 'marked'
        mineDiff = -1
    }
    else return
    var elMineCounter = document.querySelector('.mines-counter-num')
    elMineCounter.innerText = +elMineCounter.innerText + mineDiff
}

function onHintClick() {
    if (gGame.status === 'game over') return
    if (gGame.hints === 0) return

    gGame.hints--
    if (gGame.hints == 0) {
        var elHintsText = document.querySelector('.hints-text')
        elHintsText.innerText = ''
    }
    var elHintsSymbol = document.querySelector('.hints-symbol')
    elHintsSymbol.innerText = ''
    for (let i = 0; i < gGame.hints; i++) {
        elHintsSymbol.innerText += '💡'
    }
    gGame.isHintOn = true
    elHintsSymbol.style.backgroundColor = 'yellow'
}

function openNegs(loc) {
    for (let i = loc.i - 1; i <= loc.i + 1; i++) {
        if (i < 0 || i >= gGame.rows) continue
        
        for (let j = loc.j - 1; j <= loc.j + 1; j++) {
            if (j < 0 || j >= gGame.cols || (j == loc.j && i == loc.i)) continue                    
            if (gBoard[i][j].status === 'unopened') {
                onCellClick(document.querySelector(`[data-location="cell-${i}-${j}"]`))
            }
        }
    }
}

function openNegsHint(loc) {
    var elHintsSymbol = document.querySelector('.hints-symbol')
    elHintsSymbol.style.backgroundColor = ''

    for (let i = loc.i - 1; i <= loc.i + 1; i++) {
        if (i < 0 || i >= gGame.rows) continue
        
        for (let j = loc.j - 1; j <= loc.j + 1; j++) {
            if (j < 0 || j >= gGame.cols) continue                    
            let hintLoc = {i: i, j: j}
            showCell(hintLoc)
            setTimeout(hideCell, 1000, hintLoc)
        }
    }
}

function updateSmiley(smiley) {
    var elSmiley = document.querySelector('.smiley-button')
    elSmiley.innerText = smiley
}

function updateLifes() {
    var elLifeSymbol = document.querySelector('.life-symbol')
    elLifeSymbol.innerText = ''
    for (let i = 0; i < gGame.lifes; i++) {
        elLifeSymbol.innerText += LIFE + ' '
    }
}

function gameOver(state) {  // state = 'win' / 'lose'
    revelAll()
    gGame.status = 'game over'
    var text
    var smiley
    if (state === 'lose') {
        text = 'Oh no! \nYou Lost'
        updateSmiley('😵')
    }
    else if (state === 'win') {
        text = 'Hurray!\nYou Won'
        updateSmiley('😎')
    }
    var elGameOver = document.querySelector('.game-over')
    elGameOver.innerText = text
    elGameOver.style.display = 'block'
}

function checkWin() {
    for (let i = 0; i < gGame.rows; i++) {
        for (let j = 0; j < gGame.cols; j++) {
            // if   !== opened: mark or unopened   and not a mine (number or empty)
            if ((gBoard[i][j].status !== 'opened') && gBoard[i][j].content !== MINE) {
                return false
            }
        }
    }
    return true
}

function revelAll() { 
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            var loc = {i: i, j: j}
            showCell(loc)
        }
    }
}

function showCell(loc) { // NOTE: does not update status!
    const elCell = document.querySelector(`[data-location="cell-${loc.i}-${loc.j}"]`)
    if (gBoard[loc.i][loc.j].content !== 0) {
        elCell.innerText = gBoard[loc.i][loc.j].content
    }
    else {
        elCell.innerText = CLEAR
    }
}

function hideCell(loc) { // NOTE: does not update status!
    const elCell = document.querySelector(`[data-location="cell-${loc.i}-${loc.j}"]`)
    if (gBoard[loc.i][loc.j].status === 'opened') return
    if (gBoard[loc.i][loc.j].status === 'marked') {
        elCell.innerText = FLAG
    } else {
        elCell.innerText = ''
    }
}

function countMines() {

    for (let i = 0; i < gGame.rows; i++) {
        for (let j = 0; j < gGame.cols; j++) {

            if (gBoard[i][j].content !== MINE) {
                var minesAround = countNegs({i: i, j: j})               
                gBoard[i][j].content = minesAround
            }
        }
    }
}

function placeMines() {
    for (let i = 0; i < gGame.minesLoc.length; i++) {
        let loc = gGame.minesLoc[i]
        gBoard[loc.i][loc.j].content = MINE
    }
}

function countNegs(loc) {
    var mineCounter = 0
    for (let i = loc.i - 1; i <= loc.i + 1; i++) {
        if (i < 0 || i >= gGame.rows) continue
        
        for (let j = loc.j - 1; j <= loc.j + 1; j++) {
            if (j < 0 || j >= gGame.cols) continue         
            
            if (gBoard[i][j].content === MINE) mineCounter++
        }
    }
    return mineCounter
}

function createCell() {
    return {status: 'unopened', content: CLEAR}
}

function createMinesLocations(firstClickLoc) {
    var minesLoc = []
    for (let i = 0; i < gGame.mines; i++) {
        var loc = generateRandomLocation(gGame.rows, gGame.cols)
        while (isMineTaken(loc, minesLoc) || (loc.i == firstClickLoc.i && loc.j == firstClickLoc.j)) {
            loc = generateRandomLocation(gGame.rows, gGame.cols)
        }
        minesLoc.push(loc)
    } 
    return minesLoc
}

function isMineTaken(loc, minesLoc) {
    for (let i = 0; i < minesLoc.length; i++) {
        if (minesLoc[i].i === loc.i && minesLoc[i].j === loc.j) {
            return true
        }
    }
    return false
}

/// utils
function generateRandomLocation(rowsMax, colsMax) {
    let i = getRandomInt(0, rowsMax)
    let j = getRandomInt(0, colsMax)
    return {i: i, j: j}
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function playSound(fileName) {
    var audioFile = new Audio(fileName)
    audioFile.play()
}