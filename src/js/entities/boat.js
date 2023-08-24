import Empire from './empire.js';

export default class Boat {
    constructor(empire, strength, x, y, gs, direction) {
        this.empire = empire;
        this.strength = strength;
        this.x = x;
        this.y = y;
        this.gs = gs;
        this.direction = direction;
    }

    tick() {
        if (this.empire.getTerritory().size === 0) {
            this.gs.removeBoat(this);
        }

        let neighbors = this.gs.getNeighbors(this.x, this.y);
        let t = Math.floor(this.direction + (Math.random() - 0.5));
        if (t > neighbors.length - 1) {
            t = neighbors.length - 1;
        }
        if (neighbors.length <= 5) {
            this.strength = 0;
        }
        if (t < 0) {
            t += neighbors.length;
        }
        let target = neighbors[t];

        if (!target.isHabitable()) {
            this.x = target.getX();
            this.y = target.getY();
        } else {
            if (target.getEmpire() == null) {
                if (target.getHabitability() * 3 < this.strength) {
                    this.empire.addTerritory(target);
                    target.setAge(0);
                    target.setStrength(this.strength - target.getHabitability());
                }
            } else if (this.empire.getEnemies().includes(target.getEmpire())) {
                if (target.getStrength() * 3 < this.strength || Math.random() < 0.3) {
                    target.setStrength(this.strength);
                    this.empire.addTerritory(target);
                    target.setAge(0);
                } else {
                    target.setStrength(target.getStrength() - this.strength);
                }
            } else {
                if (target.getEmpire() !== this.empire) {
                    let ideoDiff = this.empire.ideoDifference(target.getEmpire());
                    let coopIso = (this.empire.getCoopIso() + target.getEmpire().getCoopIso()) / 4;
                    let borderFriction = (this.strength + target.getStrength()) / 2;
                    
                    if (ideoDiff < coopIso * Empire.getAllianceDifficulty()) {
                        this.empire.setAlly(target.getEmpire());
                    } else if (borderFriction > this.gs.getWarThreshold() && coopIso < ideoDiff && !this.empire.getEnemies().includes(target.getEmpire())) {
                        this.empire.setEnemy(target.getEmpire(), true, true);
                    } else if (this.empire.getEnemies().includes(target.getEmpire()) && ((ideoDiff + (borderFriction / 5)) * 2 < this.gs.getWarThreshold())) {
                        this.empire.makePeace(target.getEmpire());
                    }
                }
                target.setStrength(target.getStrength() + this.strength);
            }
            this.gs.removeBoat(this);
        }
        if (this.strength < 1) {
            this.gs.removeBoat(this);
        }
    }

    render(gr, scale) {
		let hue = this.empire.getColor();
		let saturation = 1.0;
		let brightness = 1.0;
        gr.fillStyle = `hsl(${hue}, ${saturation * 100}%, ${brightness * 50}%)`;
        gr.fillRect(this.x * scale, this.y * scale, scale, scale);
    }
}