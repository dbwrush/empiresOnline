// game.js

import Display from './utilities/display.js'; // Make sure you have the correct path
import MouseManager from './utilities/mouse-manager.js'; // Make sure you have the correct path
import GameState from './game-state.js'; // Make sure you have the correct path
import State from './state.js'; // Make sure you have the correct path

class Game {
    constructor(title, width, height, scale, numEmpires, warThreshold) {
        this.width = width;
        this.height = height;
        this.title = title;
        this.numEmpires = numEmpires;
        this.warThreshold = warThreshold;
        this.scale = scale;
        this.mouseManager = null; // Initialize this later in the init method
        this.display = null; // Initialize this later in the init method
        this.gameState = null; // Initialize this later in the init method
        this.running = false;
        this.bs = null;
        this.g = null;
    }

    init() {
        this.display = new Display(this.title, this.width, this.height);
        this.gameState = new GameState(this, this.width, this.height, this.scale, this.numEmpires, this.warThreshold);
        this.mouseManager = new MouseManager(this.display.getCanvas(), this);
        State.setCurrentState(this.gameState);

        window.addEventListener("resize", (event) => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        });
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.init();
            this.gameLoop();
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
        }
    }
	
	getGameState() {
		return this.gameState;
	}

    gameLoop() {
        const desiredFps = 100;
        const timePerTick = 1000 / desiredFps; // Convert to milliseconds per tick
        let delta = 0;
        let now;
        let lastTime = performance.now();
        let timer = 0;
        let ticks = 0;

        const tick = () => {
            State.getCurrentState().tick();
        };

        const render = () => {
            this.bs = this.display.getCanvas().getContext("2d");
            // Clear screen
            this.bs.clearRect(0, 0, this.width, this.height);
            // Draw here

            if (State.getCurrentState() !== null) {
                State.getCurrentState().render(this.bs);
            }
        };

        const loop = (timestamp) => {
            now = timestamp;
            delta += (now - lastTime) / timePerTick;
            timer += now - lastTime;
            lastTime = now;

            if (delta >= 1) {
                tick();
                render();
                ticks++;
                delta--;
            }

            if (timer >= 1000) {
                console.log("fps: " + ticks);
                ticks = 0;
                timer = 0;
            }

            if (this.running) {
                requestAnimationFrame(loop);
            }
        };

        loop(performance.now());
    }

    
}

// Export the Game class to be imported in other modules
export default Game;
