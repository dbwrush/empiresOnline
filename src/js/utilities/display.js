// display.js

import Pixel from '/src/js/pixel.js';
import State from '/src/js/state.js';

class Display {
    constructor(title, width, height) {
        this.title = title;
        this.width = width;
        this.height = height;

        this.createDisplay();
    }

    createDisplay() {
        this.colorMode = document.createElement("select");
        this.colorMode.id = "colorMode";
        this.colorMode.classList.add("form-select");
        this.colorMode.onchange = (event) => { State.getCurrentState().setColorMode(event.target.value) };

        this.controls = document.createElement("div");
        this.controls.id = "controls";
        this.controls.appendChild(this.colorMode);
        
		Object.entries(Pixel.ColorMode).map(obj => {
			const key   = obj[0];
			const value = obj[1];

			let option = document.createElement("option");
			option.value = key;
			option.innerText = value;
			
			this.colorMode.appendChild(option);
		});

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        window.addEventListener("resize", (event) => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        this.frame = document.createElement("div");
        this.frame.id = "frame";
        this.frame.appendChild(this.canvas);

        document.getElementById("app").appendChild(this.controls);
        document.getElementById("app").appendChild(this.frame);
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
