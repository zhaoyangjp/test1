class MinesweeperGame {
    constructor() {
        this.rows = 10;
        this.cols = 10;
        this.mineCount = 10;
        this.board = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flagCount = 0;
        
        this.init();
    }

    init() {
        this.board = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.flagCount = 0;
        
        this.clearTimer();
        this.updateDisplay();
        this.createBoard();
        this.setupEventListeners();
        this.hideResult();
    }

    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        const boardGrid = document.createElement('div');
        boardGrid.className = 'board-grid';
        
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleLeftClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
                
                boardGrid.appendChild(cell);
            }
        }
        
        gameBoard.appendChild(boardGrid);
    }

    generateMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.board[row][col].isMine && 
                !(row === excludeRow && col === excludeCol)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateNumbers();
    }

    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (this.isValidCell(newRow, newCol) && 
                                this.board[newRow][newCol].isMine) {
                                count++;
                            }
                        }
                    }
                    this.board[row][col].neighborMines = count;
                }
            }
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    handleLeftClick(e) {
        e.preventDefault();
        if (this.gameOver || this.gameWon) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isFlagged) return;
        
        if (this.firstClick) {
            this.generateMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        if (cell.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.showResult('游戏结束！踩到地雷了！', 'lose-text');
            this.clearTimer();
        } else {
            this.revealCell(row, col);
            if (this.checkWin()) {
                this.gameWon = true;
                this.showResult('恭喜你！扫雷成功！', 'win-text');
                this.clearTimer();
            }
        }
    }

    handleRightClick(e) {
        e.preventDefault();
        if (this.gameOver || this.gameWon) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flagCount--;
            e.target.textContent = '';
            e.target.classList.remove('flagged');
        } else {
            cell.isFlagged = true;
            this.flagCount++;
            e.target.textContent = '🚩';
            e.target.classList.add('flagged');
        }
        
        this.updateDisplay();
    }

    revealCell(row, col) {
        if (!this.isValidCell(row, col) || 
            this.board[row][col].isRevealed || 
            this.board[row][col].isFlagged) {
            return;
        }
        
        const cell = this.board[row][col];
        cell.isRevealed = true;
        
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('revealed');
        
        if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.classList.add(`number-${cell.neighborMines}`);
        } else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this.revealCell(row + dr, col + dc);
                }
            }
        }
    }

    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) {
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cellElement.classList.add('mine', 'revealed');
                    cellElement.textContent = '💣';
                }
            }
        }
    }

    checkWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isRevealed && !this.board[row][col].isMine) {
                    revealedCount++;
                }
            }
        }
        return revealedCount === (this.rows * this.cols - this.mineCount);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        document.getElementById('mine-count').textContent = this.mineCount - this.flagCount;
        document.getElementById('timer').textContent = this.timer;
    }

    showResult(message, className) {
        const resultDiv = document.getElementById('game-result');
        const resultText = document.getElementById('result-text');
        
        resultText.textContent = message;
        resultText.className = `result-text ${className}`;
        resultDiv.style.display = 'flex';
    }

    hideResult() {
        const resultDiv = document.getElementById('game-result');
        resultDiv.style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    restart() {
        this.clearTimer();
        this.init();
    }
}

const game = new MinesweeperGame();