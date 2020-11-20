const divides = [3, 4, 5, 6];
const blocks = [];
let blankBlock = null;

//block
const boardNode = document.getElementById('board');
const mixingTimeouts = [];

class Block{
    constructor(id, divideNum, pos, isBlank){
        this.id = id;
        this.divideNum = divideNum;
        this.position = pos;    // object with props row, column
        this.isBlank = isBlank;
        this.blockSize = (100 / this.divideNum)
        this.htmlNode = this.makeBlockNode();
    }

    makeBlockNode(){
        let htmlNode = document.createElement('div');
        htmlNode.classList.add('block')

        htmlNode.style.width = this.blockSize + "%";
        htmlNode.style.height = this.blockSize + "%";
        htmlNode.style.left = this.position.column * this.blockSize + '%';
        htmlNode.style.top = this.position.row * this.blockSize + '%';

        if (!this.isBlank){
            htmlNode.style.backgroundImage = 'url("./images/image1.jpg")';
            htmlNode.style.backgroundSize = (100 * this.divideNum) + '%';
            htmlNode.style.backgroundPosition = `${this.position.column * 100 / (this.divideNum - 1)}% \
            ${this.position.row * 100/ (this.divideNum - 1)}%`;
            htmlNode.onclick = () => {this.onBlockClick()}
        }

        boardNode.appendChild(htmlNode)
        return htmlNode;
    }

    isInGoodPos(){
        return (this.position.row * this.divideNum) + this.position.column == this.id;
    }

    canMoveBlock(){
        return Math.abs(blankBlock.position.row - this.position.row) + Math.abs(blankBlock.position.column - this.position.column) == 1;
    }

    onBlockClick(){
        if (!this.canMoveBlock()){return false}
        this.moveBlock();
        checkIfBlocksGoodPositioned();
    }

    moveBlock(){
        const blankPosition = blankBlock.position;
        const actualPosition = this.position;
        this.moveToPos(blankPosition);
        blankBlock.moveToPos(actualPosition);
    }

    moveToPos(newPos){
        this.position = newPos;
        this.htmlNode.style.left = this.position.column * this.blockSize + '%';
        this.htmlNode.style.top = this.position.row * this.blockSize + '%';
    }
}

function makeMixButtons(){
    const mixButtonsParrent = document.getElementById('mixButtons');
    divides.forEach((divideNum) => {
        const btn = document.createElement('button');
        btn.onclick = () => {
            mix(divideNum)
        }
        btn.innerText = `${divideNum} x ${divideNum}`;
        mixButtonsParrent.appendChild(btn);
    })
}

function mix(divideNum){
    console.log('mixing board for num', divideNum);
    //clearing other configuration
    boardNode.innerHTML = '';
    blocks.splice(0, blocks.length);
    mixingTimeouts.forEach((tim) => {clearTimeout(tim)});
    mixingTimeouts.splice(0, mixingTimeouts.length);

    // init blocks to board
    for (let numIterRow = 0; numIterRow < divideNum; numIterRow++) {
        for (let numIterColumn= 0; numIterColumn < divideNum; numIterColumn++) {
            let block;
            if (numIterRow + 1 == divideNum && numIterColumn + 1 == divideNum){
                block = new Block((numIterRow * divideNum) + numIterColumn, divideNum, {row: numIterRow, column: numIterColumn}, true)
                blankBlock = block;
            } else {
                block = new Block((numIterRow * divideNum) + numIterColumn, divideNum, {row: numIterRow, column: numIterColumn}, false)
            }
            blocks.push(block);
        }
    }

    // mixing blocks
    for(let i = 0; i <= Math.pow(divideNum, 3); i++){
        mixingTimeouts.push(setTimeout(function(){
            let block;
            let randomIdx;
            do{
                randomIdx = Math.floor(Math.random() * blocks.length);
                block = blocks[randomIdx]
            }while(!block.canMoveBlock());
            block.moveBlock();
        }, i*10));
    }
}

function checkIfBlocksGoodPositioned(){
    if(blocks.find(block => !block.isInGoodPos()) == undefined){
        alert('Wow, wygrałeś, super!');
    }
}

makeMixButtons();