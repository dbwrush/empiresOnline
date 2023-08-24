// main.js

import Game from '/src/js/game.js';

class Main {
    static main() {
        const game = new Game("2D net.sudologic.empires.Game", window.innerWidth, window.innerHeight, 7, 100, 50);
        game.start();
    }
}

Main.main(); // Call the static main method
