'use strict'

/**
 * gGmae have everything game related
 *  rows - number of rows
 *  cols - number of columns
 *  mines - to count the mines
 *  minesLoc - an array with {i: i, j: j} of mine locations
 * 
 * gBoard a 2D array with the board backend
 *  each cell has:
 *      status: 'open' or 'unopend'
 *      content: MINE or CLEAR
 */

const MINE = '💣'
const CLEAR = '🕳' // '🐾🏞💧🕳🔘🔵⬛⬜'

const gGame = {}
const gBoard = []

function onInit(elBtn) {
    // empty in case left from prev game
    while (gBoard.length > 0) {
        gBoard.pop()
    }

    switch (elBtn.innerText) {
        case 'beginner': 
            console.log('Starting new game at beginner level')
            buildBoard(4, 4, 2)
            console.log(gBoard)
            renderBoard()
            break 
        case 'intermidiate':
            console.log('Starting new game at intermidiate level')
            buildBoard(8, 8, 14)
            console.log(gBoard)
            renderBoard()
            break
        case 'expert': 
            console.log('Starting new game at expert level') 
            buildBoard(12, 12, 32)
            console.log(gBoard)
            renderBoard()
            break
        case 'real expert':
            console.log('Starting new game at real expert level')   
            buildBoard(16, 30, 99)
            console.log(gBoard)
            renderBoard()         
            break
    }
}

function buildBoard(rows, cols, mines) {
    gGame.rows = rows
    gGame.cols = cols
    gGame.mines = mines

    console.log(`rows: ${rows}, cols: ${cols}, mines: ${mines}`)
    for (let i = 0; i < rows; i++) {
        var row = []
        for (let j = 0; j < cols; j++) {
            row.push(createCell())
        }
        gBoard.push(row)
    }
    gGame.mines = mines
    gGame.minesLoc = createMinesLocations()
    placeMines()
}

function renderBoard() {
    
    var strHTML = '<table><tbody>'
    for (var i = 0; i < gGame.rows; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < gGame.cols; j++) {

            const cell = gBoard[i][j]

            strHTML += `<td onclick="onCellClick(this)" class="cell ${cell.status}" data-location="cell-${i}-${j}">${cell.content}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML

}

function onCellClick(elCell) {
    console.log('elCell:', elCell)
    console.log('clicked on cell data:', elCell.dataset.location)
    // cell-2-4
    var loc = elCell.dataset.location.split('-')
    loc = {i: loc[1], j: loc[2]}
    console.log('loc:', loc)
    elCell.classList.remove('unopened')
    elCell.classList.add('opend')
}

function placeMines() {
    for (let i = 0; i < gGame.minesLoc.length; i++) {
        let loc = gGame.minesLoc[i]
        gBoard[loc.i][loc.j].content = MINE
    }
}

function createCell() {
    return {status: 'unopened', content: CLEAR}
}

function createMinesLocations() {
    var minesLoc = []
    for (let i = 0; i < gGame.mines; i++) {
        var loc = generateRandomLocation(gGame.rows, gGame.cols)
        while (isMineTaken(loc, minesLoc)) {
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