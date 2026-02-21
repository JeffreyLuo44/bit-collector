// Game state and logic
class BitCollectorGame {
    constructor() {
        this.difficulties = {
            easy: { size: 5, color: '#E63946', obstacleRate: 0.08 },
            medium: { size: 8, color: '#118AB2', obstacleRate: 0.12 },
            hard: { size: 12, color: '#FFD166', obstacleRate: 0.16 }
        };

        // High-contrast palette for clearer tile distinction.
        this.gridColors = ['#1D3557', '#2A9D8F', '#F4A261', '#8D99AE', '#06D6A0', '#EF476F', '#8338EC'];
        
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
        this.obstacleRate = config.obstacleRate;
        this.moves = 0;

        // Place player at top-left
        this.playerPos = { x: 0, y: 0 };
        this.grid = this.generatePlayableGrid();
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

        // A move is only valid on a non-player-color tile.
        if (this.grid[newY][newX] === this.playerColor) {
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

        if (!this.hasAvailableMoves()) {
            this.isGameActive = false;
            return 'stuck';
        }

        return true;
    }

    generatePlayableGrid() {
        const palette = this.gridColors.filter(color => color !== this.playerColor);

        if (palette.length === 0) {
            throw new Error('No available tile colors after excluding player color.');
        }

        const totalCells = this.gridSize * this.gridSize;
        const targetPathLength = Math.max(2, Math.round(totalCells * (1 - this.obstacleRate)));
        let bestGrid = null;
        let bestScore = Number.POSITIVE_INFINITY;

        for (let attempt = 0; attempt < 320; attempt++) {
            const path = this.generateRandomPath(targetPathLength);
            if (!path) {
                continue;
            }

            const grid = [];
            for (let y = 0; y < this.gridSize; y++) {
                grid[y] = [];
                for (let x = 0; x < this.gridSize; x++) {
                    // Same-color tiles are pre-filled obstacles.
                    grid[y][x] = this.playerColor;
                }
            }

            for (let i = 1; i < path.length; i++) {
                const step = path[i];
                grid[step.y][step.x] = palette[Math.floor(Math.random() * palette.length)];
            }

            const score = this.scoreObstacleLayout(grid);
            if (score < bestScore) {
                bestGrid = grid;
                bestScore = score;
            }

            const obstacleCount = totalCells - path.length;
            const strongDispersionTarget = Math.max(2, obstacleCount * 8);
            if (score <= strongDispersionTarget) {
                return grid;
            }
        }

        if (!bestGrid) {
            throw new Error('Failed to generate a playable grid.');
        }

        return bestGrid;
    }

    generateRandomPath(targetLength) {
        const path = [{ x: 0, y: 0 }];
        const visited = new Set(['0,0']);

        const backtrack = () => {
            if (path.length === targetLength) {
                return true;
            }

            const current = path[path.length - 1];
            const candidates = this.getNeighbors(current)
                .filter(cell => !visited.has(this.toKey(cell.x, cell.y)));

            const rankedCandidates = candidates.map(cell => ({
                cell,
                // Lower degree tends to avoid trapping later cells.
                degree: this.countFutureMoves(cell, visited),
                noise: Math.random() * 1.75
            }));
            rankedCandidates.sort((a, b) => (a.degree + a.noise) - (b.degree + b.noise));

            for (const candidateData of rankedCandidates) {
                const candidate = candidateData.cell;
                const key = this.toKey(candidate.x, candidate.y);
                visited.add(key);
                path.push(candidate);

                const remaining = targetLength - path.length;
                if (remaining === 0) {
                    return true;
                }

                const capacity = this.countReachableCapacity(candidate, visited);
                if (capacity >= remaining + 1 && backtrack()) {
                    return true;
                }

                path.pop();
                visited.delete(key);
            }

            return false;
        };

        return backtrack() ? path : null;
    }

    countReachableCapacity(start, visited) {
        const startKey = this.toKey(start.x, start.y);
        const queue = [start];
        const seen = new Set([startKey]);

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = this.getNeighbors(current);

            for (const neighbor of neighbors) {
                const key = this.toKey(neighbor.x, neighbor.y);
                if (seen.has(key)) {
                    continue;
                }

                if (visited.has(key) && key !== startKey) {
                    continue;
                }

                seen.add(key);
                queue.push(neighbor);
            }
        }

        return seen.size;
    }

    countFutureMoves(cell, visited) {
        let count = 0;
        for (const neighbor of this.getNeighbors(cell)) {
            if (!visited.has(this.toKey(neighbor.x, neighbor.y))) {
                count++;
            }
        }
        return count;
    }

    getNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        for (const direction of directions) {
            const x = cell.x + direction.dx;
            const y = cell.y + direction.dy;

            if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                neighbors.push({ x, y });
            }
        }

        return neighbors;
    }

    shuffleInPlace(items) {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
    }

    toKey(x, y) {
        return `${x},${y}`;
    }

    scoreObstacleLayout(grid) {
        const stats = this.getObstacleStats(grid);
        // Prioritize breaking up one giant obstacle component, allow some adjacency.
        return (stats.largestComponent * 14) + (stats.touchingPairs * 2) - (stats.components * 3);
    }

    getObstacleStats(grid) {
        let touchingPairs = 0;
        let components = 0;
        let largestComponent = 0;
        const seen = new Set();

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (grid[y][x] !== this.playerColor) {
                    continue;
                }

                if (x + 1 < this.gridSize && grid[y][x + 1] === this.playerColor) {
                    touchingPairs++;
                }

                if (y + 1 < this.gridSize && grid[y + 1][x] === this.playerColor) {
                    touchingPairs++;
                }

                const key = this.toKey(x, y);
                if (seen.has(key)) {
                    continue;
                }

                const size = this.measureObstacleComponent(grid, x, y, seen);
                components++;
                if (size > largestComponent) {
                    largestComponent = size;
                }
            }
        }

        return { touchingPairs, components, largestComponent };
    }

    measureObstacleComponent(grid, startX, startY, seen) {
        const queue = [{ x: startX, y: startY }];
        let size = 0;
        seen.add(this.toKey(startX, startY));

        while (queue.length > 0) {
            const current = queue.shift();
            size++;

            for (const neighbor of this.getNeighbors(current)) {
                const key = this.toKey(neighbor.x, neighbor.y);
                if (seen.has(key)) {
                    continue;
                }
                if (grid[neighbor.y][neighbor.x] !== this.playerColor) {
                    continue;
                }

                seen.add(key);
                queue.push(neighbor);
            }
        }

        return size;
    }

    hasAvailableMoves() {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        for (const direction of directions) {
            const x = this.playerPos.x + direction.dx;
            const y = this.playerPos.y + direction.dy;

            if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
                continue;
            }

            if (this.grid[y][x] !== this.playerColor) {
                return true;
            }
        }

        return false;
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
