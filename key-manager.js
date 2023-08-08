// key-manager.js
class KeyManager {
    constructor() {
        this.keys = new Array(256).fill(false);

        // Add event listeners for key events
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    isKeyPressed(keyCode) {
        if (keyCode >= 0 && keyCode < this.keys.length) {
            return this.keys[keyCode];
        }
        return false;
    }

    onKeyDown(event) {
        this.keys[event.keyCode] = true;
    }

    onKeyUp(event) {
        this.keys[event.keyCode] = false;
    }
}

// Export the KeyManager class to be imported in other modules
export default KeyManager;
