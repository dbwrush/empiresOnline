// state.js
class State {
    static currentState = null;

    constructor(game) {
        this.game = game;
    }

    tick() {
        // To be implemented in derived classes
    }

    render(g) {
        // To be implemented in derived classes
    }

    static setCurrentState(state) {
        State.currentState = state;
    }

    static getCurrentState() {
        return State.currentState;
    }
}

// Export the State class to be imported in other modules
export default State;
