// main.js
class Main {
    static main() {
        const game = new Game("2D net.sudologic.empires.Game", 1280, 720, 5, 100, 50);
        game.start();
    }
}

Main.main(); // Call the static main method
