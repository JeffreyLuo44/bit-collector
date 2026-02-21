// UI and screen management
class UIManager {
    constructor() {
        this.currentDifficulty = 'medium';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start screen difficulty buttons
        document.querySelectorAll('#difficultyButtons .difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentDifficulty = e.target.dataset.difficulty;
                this.startGame();
            });
        });

        // Game screen buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.showScreen('startScreen');
        });

        // Win screen buttons
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            const difficulties = ['easy', 'medium', 'hard'];
            const currentIndex = difficulties.indexOf(this.currentDifficulty);
            this.currentDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
            this.startGame();
        });

        document.getElementById('mainMenuBtn2').addEventListener('click', () => {
            this.showScreen('startScreen');
        });
    }

    startGame() {
        game.initGame(this.currentDifficulty);
        updateGameDisplay();
        this.showScreen('gameScreen');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
}

function showWinScreen() {
    document.getElementById('winMoves').textContent = game.moves;
    uiManager.showScreen('winScreen');
}

// Global UI manager instance
const uiManager = new UIManager();

// Show start screen on load
window.addEventListener('load', () => {
    uiManager.showScreen('startScreen');
});
