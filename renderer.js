// Canvas rendering
class GameRenderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 0;
        this.padding = 10;
    }

    render(game) {
        // Calculate canvas size based on grid size
        const gridDisplaySize = Math.min(600, window.innerWidth - 100);
        this.cellSize = (gridDisplaySize - 2 * this.padding) / game.gridSize;
        
        this.canvas.width = gridDisplaySize;
        this.canvas.height = gridDisplaySize;

        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid(game);

        // Draw player
        this.drawPlayer(game);
    }

    drawGrid(game) {
        for (let i = 0; i < game.gridSize; i++) {
            for (let j = 0; j < game.gridSize; j++) {
                const x = this.padding + j * this.cellSize;
                const y = this.padding + i * this.cellSize;

                // Draw cell background
                this.ctx.fillStyle = game.grid[i][j];
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                // Draw cell border
                this.ctx.strokeStyle = '#ddd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawPlayer(game) {
        const x = this.padding + game.playerPos.x * this.cellSize;
        const y = this.padding + game.playerPos.y * this.cellSize;

        // Draw player outline/highlight
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);

        // Draw player indicator in corner
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 5, y + 5, 8, 8);
    }
}

// Global renderer instance
const renderer = new GameRenderer();

// Render game state
function updateGameDisplay() {
    renderer.render(game);
    const progress = game.getProgress();
    document.getElementById('progress').textContent = progress;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('moves').textContent = game.moves;
}
