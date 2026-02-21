// Game state and logic
class BitCollectorGame {
    constructor() {
        this.difficulties = {
            easy: { size: 5, color: '#FF6B6B' },
            medium: { size: 8, color: '#4ECDC4' },
            hard: { size: 12, color: '#FFE66D' }
        };
        
        this.grid = [];
        this.playerPos = { x: 0, y: 0 };
        this.playerColor = '';
        this.moves = 0;
        this.gridSize = 0;
        this.isGameActive = false;
    }

    initGame(difficulty) {
        const config = this.difficulties[difficulty];
        this.gridSize = config.size;
        this.playerColor = config.color;
        this.moves = 0;

        // Initialize grid with random colors
        this.grid = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
        
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = colors[Math.floor(Math.random() * colors.length)];
            }
        }

        // Place player at top-left
        this.playerPos = { x: 0, y: 0 };
        this.grid[0][0] = this.playerColor;
        this.isGameActive = true;
    }

    movePlayer(dx, dy) {
        if (!this.isGameActive) return false;

        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        // Check bounds
        if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
            return false;
        }

        // Move player and fill cell
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this.grid[newY][newX] = this.playerColor;
        this.moves++;

        // Check win condition
        if (this.checkWin()) {
            this.isGameActive = false;
            return 'win';
        }

        return true;
    }

    checkWin() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== this.playerColor) {
                    return false;
                }
            }
        }
        return true;
    }

    getProgress() {
        let filledCells = 0;
        const totalCells = this.gridSize * this.gridSize;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === this.playerColor) {
                    filledCells++;
                }
            }
        }

        return Math.round((filledCells / totalCells) * 100);
    }

    restart(difficulty) {
        this.initGame(difficulty);
    }
}

// Global game instance
const game = new BitCollectorGame();
