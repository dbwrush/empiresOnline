// display.js
class Display {
    constructor(title, width, height) {
        this.title = title;
        this.width = width;
        this.height = height;

        this.createDisplay();
    }

    createDisplay() {
        this.frame = document.createElement("div");
        this.frame.classList.add("frame");

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.frame.appendChild(this.canvas);
        document.body.appendChild(this.frame);
    }

    getCanvas() {
        return this.canvas;
    }

    getFrame() {
        return this.frame;
    }
}

// Export the Display class to be imported in other modules
export default Display;
