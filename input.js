// Input handling
class InputHandler {
    constructor() {
        this.keysPressed = {};
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keysPressed[key] = true;

            // Handle movement
            if (['arrowup', 'w'].includes(key)) {
                this.handleMove(0, -1);
                e.preventDefault();
            } else if (['arrowdown', 's'].includes(key)) {
                this.handleMove(0, 1);
                e.preventDefault();
            } else if (['arrowleft', 'a'].includes(key)) {
                this.handleMove(-1, 0);
                e.preventDefault();
            } else if (['arrowright', 'd'].includes(key)) {
                this.handleMove(1, 0);
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    handleMove(dx, dy) {
        const result = game.movePlayer(dx, dy);
        
        if (result === 'win') {
            showWinScreen();
        } else if (result) {
            updateGameDisplay();
        }
    }
}

// Global input handler instance
const inputHandler = new InputHandler();
