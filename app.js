const divides = [3, 4, 5, 6];
const blocks = [];
let blankBlock = null;
let stopMoving = false;     // variable to stop all not ended block moving

//timer
const timerBlock = document.getElementById('timer');
const timeDividers = [10*60*60*1000, 60*60*1000, -1, 10*60*1000, 60 * 1000, -1, 10*1000, 1000, -2, 100, 10, 1];
let timerInterval = null;
let startTimeMs = 0;

//block
const SLIDING_BLOCKS_TIME = 10;
const SLIDING_BLOCKS_SMOOTH = 4;
const boardNode = document.getElementById('board');


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
        htmlNode.onclick = () => {this.onBlockClick()}

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
    }
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

function updateTimer(timeEllapsed=Date.now() - startTimeMs, returnTimeStr=false){
    let timeStr = '';

    for (let timeDividerIdx = 0; timeDividerIdx < timeDividers.length; timeDividerIdx++) {
        const timeDivider = timeDividers[timeDividerIdx];
        if (timeDivider < 0){      // if image is colon or dot add to str and not update image
            if (returnTimeStr){
                if (timeDivider == -1){
                    timeStr += ':';
                }
                else if (timeDivider == -2){
                    timeStr += '.';
                }
            }
            continue
        }
        
        const posNum = Math.floor(timeEllapsed / timeDivider);
        timeEllapsed = timeEllapsed % timeDivider;
        timerBlock.children[timeDividerIdx].src = `./images/numbers/c${posNum}.gif`

        if (returnTimeStr){
            timeStr += posNum.toString();
        }
    }

    if (returnTimeStr){
        return timeStr;
    }
}

//win panel
function displayWin(){
    let overlayPanel = document.getElementById('overlayPanel')
    overlayPanel.style.display = 'flex';
    let timeStr = updateTimer(undefined, true);
    overlayPanel.querySelector('p').innerText = `Wow, you win, nice!\nIt tooks you ${timeStr}`
    stopTimer(false);
}

function closeOverlay(){
    document.getElementById('overlayPanel').style.display = 'none';
    stopTimer();
}

makeTimer();
makeMixButtons();