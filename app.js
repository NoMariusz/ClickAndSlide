const divides = [3, 4, 5, 6];
const blocks = [];
let blankBlock = null;

//timer
const timerBlock = document.getElementById('timer');
const timeDividers = [10*60*60*1000, 60*60*1000, -1, 10*60*1000, 60 * 1000, -1, 10*1000, 1000, -2, 100, 10, 1];
let timerInterval = null;
let startTimeMs = 0;
let timeEllapsed = 0;

//block
const SLIDING_BLOCKS_TIME = 50;
const SLIDING_BLOCKS_SMOOTH = 4;
const boardNode = document.getElementById('board');
let stopMoving = false;     // variable to stop all not ended block moving

//records
let actualDivider = 3;


class Block{
    constructor(id, divideNum, pos, isBlank){
        this.id = id;
        this.divideNum = divideNum;
        this.position = pos;    // object with props row, column
        this.isBlank = isBlank;
        this.blockSize = (100 / this.divideNum)
        this.htmlNode = isBlank ? null : this.makeBlockNode();
    }

    makeBlockNode(){
        let htmlNode = document.createElement('div');
        htmlNode.classList.add('block')

        htmlNode.style.width = this.blockSize + "%";
        htmlNode.style.height = this.blockSize + "%";
        htmlNode.style.left = this.position.column * this.blockSize + '%';
        htmlNode.style.top = this.position.row * this.blockSize + '%';

        htmlNode.style.backgroundImage = 'url("./images/image1.jpg")';
        htmlNode.style.backgroundSize = (100 * this.divideNum) + '%';
        htmlNode.style.backgroundPosition = `${this.position.column * 100 / (this.divideNum - 1)}% \
        ${this.position.row * 100/ (this.divideNum - 1)}%`;

        boardNode.appendChild(htmlNode)
        return htmlNode;
    }

    isInGoodPos(){
        return (this.position.row * this.divideNum) + this.position.column == this.id;
    }

    canMoveBlock(){
        if (this.isBlank) {return false}
        return Math.abs(blankBlock.position.row - this.position.row) + Math.abs(blankBlock.position.column - this.position.column) == 1;
    }

    onBlockClick(){
        if (!this.canMoveBlock()){return false}
        this.moveBlock().then(() => {
            checkIfBlocksGoodPositioned()
        });
    }

    async moveBlock(){
        const blankPosition = blankBlock.position;
        const actualPosition = this.position;
        await this.moveToPos(blankPosition)
        if (!stopMoving){
            blankBlock.position = actualPosition;
        }
    }

    async moveToPos(newPos){
        let positionToIncrease = {left: (newPos.column - this.position.column) * this.blockSize / SLIDING_BLOCKS_SMOOTH,
            top: (newPos.row - this.position.row) * this.blockSize / SLIDING_BLOCKS_SMOOTH}
        for (let moveIter = 1; moveIter <= SLIDING_BLOCKS_SMOOTH; moveIter++) {
            if (stopMoving){return false};
            this.htmlNode.style.left = this.position.column * this.blockSize + positionToIncrease.left * moveIter + '%';
            this.htmlNode.style.top = this.position.row * this.blockSize + positionToIncrease.top * moveIter+ '%';
            await sleep(SLIDING_BLOCKS_TIME / SLIDING_BLOCKS_SMOOTH);
        }
        this.position = newPos;
    }

    addClickEvent(){
        this.htmlNode.onclick = () => {this.onBlockClick()}
    }
}

function makeMixButtons(){
    const mixButtonsParrent = document.getElementById('mixButtons');
    divides.forEach((divideNum) => {
        const btn = document.createElement('button');
        btn.onclick = () => {mix(divideNum)}
        btn.innerText = `${divideNum} x ${divideNum}`;
        mixButtonsParrent.appendChild(btn);
    })
}

function mix(divideNum){
    console.log('mixing board for num', divideNum);
    actualDivider = divideNum;
    //clearing other blocks
    boardNode.innerHTML = '';
    blocks.splice(0, blocks.length);

    //stopping oldTimer
    stopTimer();
    
    // init blocks
    for (let numIter = 0; numIter < Math.pow(divideNum, 2) -1; numIter++) {
        blocks.push(new Block(numIter, divideNum, {row: Math.floor(numIter/divideNum), column: numIter%divideNum}, false));
    }
    blankBlock = new Block(Math.pow(divideNum, 2) -1, divideNum, {row: divideNum -1, column: divideNum -1}, true);
    blocks.push(blankBlock);
    
    // mixing blocks
    mixBlocks(divideNum);

    blocks.forEach(block => {if (!block.isBlank) { block.addClickEvent()}})
}

async function mixBlocks(divideNum){    // function moving random blocks in board to mix them, 
    // to stop moving old blocks
    stopMoving = true;
    await sleep(SLIDING_BLOCKS_TIME / SLIDING_BLOCKS_SMOOTH * 10);   // wait to all old blocks stop moving
    stopMoving = false;

    let lastBlockId = -1   // var to store id of last moved block, to not move that same block twice
    for(let i = 0; i <= Math.pow(divideNum, 3); i++){
        let block;
        let randomIdx;
        do{
            randomIdx = Math.floor(Math.random() * blocks.length);
            block = blocks[randomIdx]
        }while((!block.canMoveBlock()) || lastBlockId == block.id);
        lastBlockId = block.id;
        await block.moveBlock();
        if (stopMoving){    // break loop if stop moving
            return false;
        }
    }
    startTimer();
}

function checkIfBlocksGoodPositioned(){
    if(blocks.find(block => !block.isInGoodPos()) == undefined){    // if not found block that not isInGoodPos, then all blocks are in valid pos
        displayWin();
        lockBlocksAfterWin();
    }
}

function lockBlocksAfterWin() {
    blocks.forEach(block => block.htmlNode.onclick = null);
}

function sleep(ms) {        // function to sleep in async functions
    return new Promise(resolve => setTimeout(resolve, ms));
}

// timer
function makeTimer(){
    for (let numIter = 0; numIter < timeDividers.length; numIter++) {
        const img = document.createElement('img');
        if (timeDividers[numIter] == -2){
            img.src = './images/numbers/dot.gif';
        }
        else if (timeDividers[numIter] == -1){
            img.src = './images/numbers/colon.gif';
        } else {
            img.src = './images/numbers/c0.gif';
        }
        timerBlock.appendChild(img);
    }
}

function startTimer() {
    startTimeMs = Date.now();
    timerInterval = setInterval(updateTimer, 1);
}

function stopTimer(update=true){
    clearInterval(timerInterval);
    if (update){updateTimer(0)};
}

function updateTimer(setTime=undefined){
    timeEllapsed = setTime==undefined ? Date.now() - startTimeMs : setTime
    let tempTimeEllapsed = timeEllapsed
    for (let timeDividerIdx = 0; timeDividerIdx < timeDividers.length; timeDividerIdx++) {
        const timeDivider = timeDividers[timeDividerIdx];
        if (timeDivider < 0){      // if image is colon or dot add to str and not update image
            continue
        }
        const posNum = Math.floor(tempTimeEllapsed / timeDivider);
        tempTimeEllapsed = tempTimeEllapsed % timeDivider;
        timerBlock.children[timeDividerIdx].src = `./images/numbers/c${posNum}.gif`
    }
}

function makeTimeStr(msTime=timeEllapsed){
    let timeStr = '';
    for (let timeDividerIdx = 0; timeDividerIdx < timeDividers.length; timeDividerIdx++) {
        const timeDivider = timeDividers[timeDividerIdx];
        if (timeDivider < 0){      // if image is colon or dot add to str and not update image
            if (timeDivider == -1){
                timeStr += ':';
            }
            else if (timeDivider == -2){
                timeStr += '.';
            }
            continue
        }
        
        const posNum = Math.floor(msTime / timeDivider);
        msTime = msTime % timeDivider;
        timeStr += posNum.toString();
    }
    return timeStr
}

//win panel
function displayWin(){
    let overlayPanel = document.getElementById('overlayPanel')
    overlayPanel.style.display = 'flex';
    let timeStr = makeTimeStr();
    overlayPanel.querySelector('p').innerText = `Wow, you win, nice!\nIt tooks you ${timeStr}`
    stopTimer(false);
}

function closeOverlay(){
    let nick = document.getElementById('nickInput');
    addNewRecord([nick.value, timeEllapsed]); // adding new result to records
    nick.value = '';    // clearing input

    document.getElementById('overlayPanel').style.display = 'none';
    stopTimer();
}

//records
function saveRecordsToCookie(saveObj){
    document.cookie = `RecordsData=${encodeURIComponent(JSON.stringify(saveObj))};Expires=${new Date(Date.now() + 1000*60*60*24*3).toUTCString()}`
}

function getRecordsFromCookie(){
    if (document.cookie.split(';')[0].split('=')[0] != 'RecordsData'){return false}
    return JSON.parse(decodeURIComponent(document.cookie.split(';')[0].split('=')[1]));
}

function initRecords(){
    if (getRecordsFromCookie() === false){  // if at browser there is no result cookie, then add it
        let dataTemplate = {}
        divides.forEach( divider => {dataTemplate[divider] = Array(10).fill([])})   // making template to results
        saveRecordsToCookie(dataTemplate);
    }
}

function addNewRecord(result){      // adding new result, if time is not at best, then not change records
    let recordsObj = getRecordsFromCookie()
    for (let recordsIdx = 0; recordsIdx < 10; recordsIdx++) {
        const record = recordsObj[actualDivider][recordsIdx];
        if(result[1] < record[1] || record.length == 0){    // if records are worse than result, or records is empty, then add new record
            recordsObj[actualDivider].splice(recordsIdx, 0, result);
            recordsObj[actualDivider] = recordsObj[actualDivider].slice(0, 10);
            break;
        }
    }
    saveRecordsToCookie(recordsObj);
    loadRecordsToPage();
}

function displayRecords(e){
    let recordPanel = document.getElementById('recordsPanel')
    if (recordPanel.classList.contains('hidden')) {
        recordPanel.classList.remove('hidden')
        e.target.innerHTML = '<'
    } else {
        e.target.innerHTML = '>'
        recordPanel.classList.add('hidden')
    }
}

function displayRecordsPanel(num, btn){
    let buttons = document.querySelectorAll('#dividersSelect button')   // clearing color from other buttons
    for (let btnIdx = 0; btnIdx < buttons.length; btnIdx++) {
        buttons[btnIdx].classList.remove('selected')
    }
    btn.classList.add('selected')   // adding special look to clicked button

    let resultsBlocks = document.getElementsByClassName('results')      // hide all blocks and unhide choosen block with records
    for (let resultIdx = 0; resultIdx < resultsBlocks.length; resultIdx++) {
        resultsBlocks[resultIdx].classList.add('hidden')
        if (resultIdx == divides.indexOf(num)) {
            resultsBlocks[resultIdx].classList.remove('hidden')
        }
    }
}

function loadRecordsToPage(){
    let resultsBlocks = document.getElementsByClassName('results')
    let recordsObj = getRecordsFromCookie()
    divides.forEach(divider => {    // for all block for divider records add 10 rows with records (place, nick, time)
        let resultBlock = resultsBlocks[divides.indexOf(divider)];
        resultBlock.innerHTML = '';
        for (let recordIdx = 0; recordIdx < recordsObj[divider].length; recordIdx++) {
            const record = recordsObj[divider][recordIdx];
            let row = document.createElement('div')
            row.classList.add('row');
            resultBlock.appendChild(row);

            function makeP(str, nick=false){    // making <p> node and add to row
                if (str == undefined) {str = '-'}
                let p = document.createElement('p')
                p.innerText = str;
                if(nick){p.classList.add('nickP')};     // nick have special styling
                row.appendChild(p);
            }

            makeP(recordIdx + 1)
            makeP((record[0] == undefined ? '' : record[0]).slice(0, 13), true)
            makeP(makeTimeStr(record[1] == undefined ? 0 : record[1]))
        }
    })
}

makeTimer();
makeMixButtons();
initRecords();
loadRecordsToPage();