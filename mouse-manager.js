// mouse-manager.js
class MouseManager {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.clickPosition = { x: 0, y: 0 };

        // Add event listeners for mouse events
        canvas.addEventListener("click", this.onClick.bind(this));
    }

    onClick(event) {
        // Get the mouse click position relative to the canvas
        this.clickPosition.x = event.clientX - this.canvas.getBoundingClientRect().left;
        this.clickPosition.y = event.clientY - this.canvas.getBoundingClientRect().top;

        // Handle the click event, e.g., call a method to process the click
        this.handleMouseClick(this.clickPosition);
    }

    handleMouseClick(clickPosition) {
        this.game.getGameState().mouseClicked(clickPosition);
    }
}

// Export the MouseManager class to be imported in other modules
export default MouseManager;
